-- CreateTable
CREATE TABLE "Signature" (
    "id" SERIAL NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "signature" JSONB NOT NULL,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("id")
);
