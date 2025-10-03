import React, { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  toUserId: number;
};

const STRIPE_PUBLISHABLE = 'pk_test_51SDQmuC43NOGGMR33uTOpWQiSiuocDddKt9GDPIoNHnrCph9hbhe9JBK8vQjJOjBKdTXNK5ITNhgIekfiOvJ3JCN00oFEkRMYb';

const DonateModal: React.FC<Props> = ({ isOpen, onClose, toUserId }) => {
  const [amount, setAmount] = useState('5');
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    const a = Math.round(parseFloat(amount.replace(',', '.')) * 100);
    if (!Number.isFinite(a) || a < 100) { alert('Montant minimal: 1€'); return; }
    setLoading(true);
    try {
      const { createDonationCheckoutSession } = await import('../apis/DonateService');
      const { id } = await createDonationCheckoutSession(toUserId, a, 'eur');
      const stripeJs = await loadStripe();
      await stripeJs.redirectToCheckout({ sessionId: id });
    } catch (e: any) {
      // Log complet pour debug
      console.error('Donation error:', e?.response?.data || e);

      // Récupération d’un message lisible
      const data = e?.response?.data;
      const msg =
        data?.error ||
        data?.message ||
        (data?.errors
          ? Object.values(data.errors).flat()[0] // 1er message de validation Laravel
          : null) ||
        e?.message ||
        "Erreur inconnue";

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadStripe = () =>
    new Promise<any>((resolve, reject) => {
      if ((window as any).Stripe) return resolve((window as any).Stripe(STRIPE_PUBLISHABLE));
      const s = document.createElement('script'); s.src = 'https://js.stripe.com/v3/';
      s.onload = () => resolve((window as any).Stripe(STRIPE_PUBLISHABLE));
      s.onerror = reject;
      document.body.appendChild(s);
    });

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 420 }}>
        <h3>Faire un don</h3>
        <label style={{ display:'block', marginBottom:8 }}>Montant (EUR)</label>
        <input
          type="number"
          min={1}
          step="0.5"
          value={amount}
          onChange={(e)=>setAmount(e.target.value)}
          style={{ width:'100%', padding:8, marginBottom:16 }}
        />
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} disabled={loading}>Annuler</button>
          <button className="primary" onClick={onConfirm} disabled={loading}>
            {loading ? 'Redirection…' : 'Payer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonateModal;
