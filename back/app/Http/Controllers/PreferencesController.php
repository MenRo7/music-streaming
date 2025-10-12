<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\Stripe;

class PreferencesController extends Controller
{
    // ⛔️ PAS de __construct() ici

    public function index()
    {
        $u = Auth::user();

        $stripe = null;
        if ($u->stripe_connect_id) {
            Stripe::setApiKey(config('services.stripe.secret'));
            $acct = Account::retrieve($u->stripe_connect_id);
            $stripe = [
                'account_id' => $acct->id,
                'charges_enabled' => (bool) $acct->charges_enabled,
                'payouts_enabled' => (bool) $acct->payouts_enabled,
                'currently_due' => $acct->requirements->currently_due ?? [],
            ];
        }

        return response()->json([
            'locale' => $u->locale ?? config('app.locale'),
            'stripe_connect_id' => $u->stripe_connect_id,
            'stripe' => $stripe,
        ]);
    }

    public function setLocale(Request $request)
    {
        $request->validate([
            'locale' => 'required|string|in:fr,en',
        ]);

        $u = Auth::user();
        $u->locale = $request->input('locale');
        $u->save();

        return response()->json(['ok' => true, 'locale' => $u->locale]);
    }

    public function createStripeOnboarding()
    {
        $u = Auth::user();
        Stripe::setApiKey(config('services.stripe.secret'));

        if (! $u->stripe_connect_id) {
            $acct = Account::create([
                'type' => 'express',
                'country' => 'FR',
                'email' => $u->email,
                'capabilities' => ['transfers' => ['requested' => true]],
                'business_type' => 'individual',
            ]);
            $u->stripe_connect_id = $acct->id;
            $u->save();
        } else {
            $acct = Account::retrieve($u->stripe_connect_id);
        }

        $link = AccountLink::create([
            'account' => $acct->id,
            'refresh_url' => config('services.stripe.frontend_url') . '/preferences?onboarding=refresh',
            'return_url' => config('services.stripe.frontend_url') . '/preferences?onboarding=success',
            'type' => 'account_onboarding',
        ]);

        return response()->json([
            'onboarding_url' => $link->url,
            'account_id' => $acct->id,
        ]);
    }

    public function stripeStatus()
    {
        $u = Auth::user();

        if (! $u->stripe_connect_id) {
            return response()->json([
                'has_connect' => false,
                'charges_enabled' => false,
                'payouts_enabled' => false,
                'currently_due' => [],
            ]);
        }

        Stripe::setApiKey(config('services.stripe.secret'));
        $acct = Account::retrieve($u->stripe_connect_id);

        return response()->json([
            'has_connect' => true,
            'account_id' => $acct->id,
            'charges_enabled' => (bool) $acct->charges_enabled,
            'payouts_enabled' => (bool) $acct->payouts_enabled,
            'currently_due' => $acct->requirements->currently_due ?? [],
        ]);
    }
}
