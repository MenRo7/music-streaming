<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model {
    protected $fillable = [
        'from_user_id','to_user_id','amount_cents','currency','status',
        'stripe_session_id','stripe_payment_intent'
    ];
    public function fromUser(){ return $this->belongsTo(User::class,'from_user_id'); }
    public function toUser(){ return $this->belongsTo(User::class,'to_user_id'); }
}
