<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\Checkout\Session as Checkout;

class DonationController extends Controller
{
    public function createCheckoutSession(Request $req, int $userId) {
        $req->validate([
            'amount_cents' => 'required|integer|min:100|max:2000000', // 1€ - 20 000€
            'currency' => 'in:eur,usd,gbp' // adapte
        ]);
        $currency = $req->input('currency','eur');

        $artist = User::findOrFail($userId);
        if (!$artist->stripe_connect_id) {
            return response()->json(['error' => "L'artiste n'a pas encore de compte de paiement actif."], 422);
        }

        $fromUserId = Auth::id();
        $donation = Donation::create([
            'from_user_id' => $fromUserId,
            'to_user_id'   => $artist->id,
            'amount_cents' => $req->amount_cents,
            'currency'     => $currency,
            'status'       => 'created',
        ]);

        Stripe::setApiKey(config('services.stripe.secret') ?? env('STRIPE_SECRET'));
        $feeBps = (int) env('STRIPE_CONNECT_APP_FEE_BPS', 0); // ex: 500 = 5%
        $application_fee_amount = intdiv($donation->amount_cents * $feeBps, 10000);

        $session = Checkout::create([
            'mode' => 'payment',
            'payment_method_types' => ['card'],
            'line_items' => [[
                'quantity' => 1,
                'price_data' => [
                    'currency' => $currency,
                    'unit_amount' => $donation->amount_cents,
                    'product_data' => [
                        'name' => "Don à {$artist->name}",
                    ],
                ],
            ]],
            'success_url' => env('FRONTEND_URL')."/profile?user={$artist->id}&don=ok",
            'cancel_url'  => env('FRONTEND_URL')."/profile?user={$artist->id}&don=ko",
            // envoi direct au compte de l'artiste + éventuelle commission plateforme
            'payment_intent_data' => [
                'application_fee_amount' => $application_fee_amount,
                'transfer_data' => [
                    'destination' => $artist->stripe_connect_id,
                ],
                'metadata' => [
                    'donation_id' => (string) $donation->id,
                    'to_user_id'  => (string) $artist->id,
                    'from_user_id'=> (string) ($fromUserId ?? 0),
                ],
            ],
            'metadata' => ['donation_id' => (string) $donation->id],
        ]);

        $donation->update(['stripe_session_id' => $session->id]);

        return response()->json(['id' => $session->id]);
    }

    // Webhook pour confirmer le paiement
    public function webhook(Request $request) {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = env('STRIPE_WEBHOOK_SECRET');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
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
