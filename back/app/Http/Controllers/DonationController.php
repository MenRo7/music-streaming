<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\Account;
use Stripe\Checkout\Session as Checkout;
use Stripe\Stripe;

class DonationController extends Controller
{
    public function createCheckoutSession(Request $req, int $userId)
    {
        $req->validate([
            'amount_cents' => 'required|integer|min:100|max:2000000',
            'currency' => 'in:eur,usd,gbp',
        ]);
        $currency = $req->input('currency', 'eur');
        $viewer = Auth::user();
        if (! $viewer || ! $viewer->date_of_birth || $viewer->date_of_birth->age < 18) {
            return response()->json([
                'error' => 'Donations are reserved for adult users (18+).',
            ], 403);
        }
        $artist = User::findOrFail($userId);

        if (! $artist->stripe_connect_id) {
            return response()->json(['error' => 'The artist does not have an active payment account yet.'], 422);
        }

        Stripe::setApiKey(config('services.stripe.secret') ?? env('STRIPE_SECRET'));
        try {
            $acct = Account::retrieve($artist->stripe_connect_id);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Unable to verify the artist\'s payment account.',
            ], 422);
        }

        $enabledNow = (bool) ($acct->charges_enabled && $acct->payouts_enabled);

        if ($enabledNow && ! $artist->payments_enabled) {
            $artist->payments_enabled = true;
            $artist->save();
        }

        if (! $enabledNow) {
            $due = $acct->requirements->currently_due ?? [];

            return response()->json([
                'error' => 'Payments for this artist are not yet enabled.',
                'currently_due' => $due,
                'account_id' => $acct->id,
                'charges_enabled' => (bool) $acct->charges_enabled,
                'payouts_enabled' => (bool) $acct->payouts_enabled,
            ], 422);
        }

        $fromUserId = Auth::id();
        $donation = Donation::create([
            'from_user_id' => $fromUserId,
            'to_user_id' => $artist->id,
            'amount_cents' => $req->amount_cents,
            'currency' => $currency,
            'status' => 'created',
        ]);

        $feeBps = (int) env('STRIPE_CONNECT_APP_FEE_BPS', 0); // ex: 500 = 5%
        $application_fee_amount = intdiv($donation->amount_cents * $feeBps, 10000);

        try {
            $session = Checkout::create([
                'mode' => 'payment',
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'quantity' => 1,
                    'price_data' => [
                        'currency' => $currency,
                        'unit_amount' => $donation->amount_cents,
                        'product_data' => [
                            'name' => "Donation to {$artist->name}",
                        ],
                    ],
                ]],
                'success_url' => (config('services.stripe.frontend_url') ?? env('FRONTEND_URL')) . "/profile?user={$artist->id}&don=ok",
                'cancel_url' => (config('services.stripe.frontend_url') ?? env('FRONTEND_URL')) . "/profile?user={$artist->id}&don=ko",

                'payment_intent_data' => [
                    'application_fee_amount' => $application_fee_amount,
                    'transfer_data' => [
                        'destination' => $artist->stripe_connect_id,
                    ],
                    'metadata' => [
                        'donation_id' => (string) $donation->id,
                        'to_user_id' => (string) $artist->id,
                        'from_user_id' => (string) ($fromUserId ?? 0),
                    ],
                ],
                'metadata' => ['donation_id' => (string) $donation->id],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Unable to initialize Stripe payment.',
            ], 422);
        }

        $donation->update(['stripe_session_id' => $session->id]);

        return response()->json(['id' => $session->id]);
    }

    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = env('STRIPE_WEBHOOK_SECRET');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        if (in_array($event->type, ['account.updated', 'capability.updated'])) {
            $obj = $event->data->object;
            $accountId = $obj->id ?? ($obj->account ?? null);

            if ($accountId) {
                try {
                    Stripe::setApiKey(config('services.stripe.secret') ?? env('STRIPE_SECRET'));
                    $acct = Account::retrieve($accountId);
                    $enabled = (bool) ($acct->charges_enabled && $acct->payouts_enabled);

                    User::where('stripe_connect_id', $acct->id)
                        ->update(['payments_enabled' => $enabled]);
                } catch (\Throwable $e) {
                    // Optionnel : log
                }
            }
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $donationId = $session->metadata->donation_id ?? null;

            if ($donationId) {
                Donation::where('id', $donationId)->update([
                    'status' => 'paid',
                    'stripe_payment_intent' => $session->payment_intent ?? null,
                ]);
            }
        }

        if ($event->type === 'payment_intent.payment_failed') {
            $pi = $event->data->object;
            $donationId = $pi->metadata->donation_id ?? null;

            if ($donationId) {
                Donation::where('id', $donationId)->update(['status' => 'failed']);
            }
        }

        return response()->json(['ok' => true]);
    }
}
