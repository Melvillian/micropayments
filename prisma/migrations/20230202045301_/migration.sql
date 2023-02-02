-- CreateTable
CREATE TABLE "PaymentChannel2" (
    "id" SERIAL NOT NULL,
    "owner" TEXT NOT NULL,
    "spender" TEXT NOT NULL,
    "value" BIGINT NOT NULL,
    "nonce" BIGINT NOT NULL,
    "deadline" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "paymentChannelContract" TEXT NOT NULL,
    "signingKeyAddress" TEXT NOT NULL,
    "permitV" TEXT,
    "permitR" TEXT,
    "permitS" TEXT,
    "microPaymentMessageV" TEXT,
    "microPaymentMessageR" TEXT,
    "microPaymentMessageS" TEXT,
    "closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PaymentChannel2_pkey" PRIMARY KEY ("id")
);
