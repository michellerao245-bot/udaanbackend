// ==================== PAYMENT SERVICE ====================
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');

// ==================== GENERATE ORDER ID ====================
const generateOrderId = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

// ==================== GENERATE CHECKSUM (PhonePe) ====================
const generateChecksum = (payload, saltKey, saltIndex = 1) => {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const string = base64Payload + '/pg/v1/pay' + saltKey;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  return `${sha256}###${saltIndex}`;
};

// ==================== CREATE PAYMENT ORDER ====================
const createPaymentOrder = async (companyId, data) => {
  const { planId, amount } = data;

  if (!planId || !amount) {
    throw new Error('Plan ID aur Amount zaroori hai');
  }

  const orderId = generateOrderId();

  // Payment record banao
  const { data: payment, error } = await supabaseAdmin
    .from('payments')
    .insert({
      company_id: companyId,
      order_id: orderId,
      amount: Number(amount),
      status: 'PENDING',
      plan_id: planId,
      plan_name: planId,
      currency: 'INR',
    })
    .select()
    .single();

  if (error) throw error;

  // ⚠️ PhonePe KYC ke baad ye actual hoga
  // Abhi dummy response
  const isKycApproved = !!process.env.PHONEPE_MERCHANT_ID;

  if (isKycApproved) {
    // Real PhonePe integration
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId: orderId,
      merchantUserId: companyId,
      amount: Number(amount) * 100, // Paise me
      redirectUrl: `${process.env.FRONTEND_URL}/payment/callback`,
      redirectMode: 'POST',
      callbackUrl: `${process.env.PHONEPE_CALLBACK_URL}`,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const checksum = generateChecksum(
      payload,
      process.env.PHONEPE_SALT_KEY,
      process.env.PHONEPE_SALT_INDEX
    );

    return {
      orderId,
      amount: Number(amount),
      payload,
      checksum,
      payUrl: `${process.env.PHONEPE_BASE_URL}/pg/v1/pay`,
      environment: process.env.PHONEPE_ENV || 'sandbox',
    };
  } else {
    // Dummy payment mode (KYC pending)
    return {
      orderId,
      amount: Number(amount),
      dummy: true,
      message: 'PhonePe KYC pending. Dummy payment mode.',
      simulateUrl: `/api/payment/simulate/${orderId}`,
    };
  }
};

// ==================== VERIFY PAYMENT ====================
const verifyPayment = async (orderId, txnId, status) => {
  const { data: payment, error: fetchError } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (fetchError || !payment) {
    throw new Error('Payment not found');
  }

  if (payment.status === 'SUCCESS') {
    return { alreadyProcessed: true, payment };
  }

  const isSuccess = status === 'SUCCESS';

  // Update payment
  const { data: updatedPayment, error } = await supabaseAdmin
    .from('payments')
    .update({
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      paytm_txn_id: txnId,
      completed_at: new Date().toISOString(),
      response_message: status,
    })
    .eq('order_id', orderId)
    .select()
    .single();

  if (error) throw error;

  // Payment success → Subscription activate
  if (isSuccess) {
    await activateSubscription(payment.company_id, payment.plan_id);
  }

  return { payment: updatedPayment, activated: isSuccess };
};

// ==================== ACTIVATE SUBSCRIPTION ====================
const activateSubscription = async (companyId, planId) => {
  // Plan details lo
  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (!plan) throw new Error('Plan not found');

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1); // 1 month

  const { data: company, error } = await supabaseAdmin
    .from('companies')
    .update({
      status: 'ACTIVE',
      plan_id: plan.id,
      plan_name: plan.name,
      subscription_start: startDate.toISOString(),
      subscription_end: endDate.toISOString(),
      subscription_status: 'ACTIVE',
      max_users: plan.max_users,
      max_products: plan.max_products,
      max_distributors: plan.max_distributors,
    })
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;

  console.log(`✅ Subscription activated: ${company.name} → ${plan.name}`);
  return company;
};

// ==================== PAYMENT HISTORY ====================
const getPaymentHistory = async (companyId, limit = 50) => {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

// ==================== PAYMENT STATUS ====================
const getPaymentStatus = async (orderId) => {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error) return null;
  return data;
};

// ==================== EXPORTS ====================
module.exports = {
  createPaymentOrder,
  verifyPayment,
  activateSubscription,
  getPaymentHistory,
  getPaymentStatus,
  generateOrderId,
};