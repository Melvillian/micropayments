-- CreateTable
CREATE TABLE "PaymentChannel" (
    "id" SERIAL NOT NULL,
    "from" TEXT NOT NULL,
    "contents" TEXT NOT NULL,
    "signature" JSONB NOT NULL,
    "data" TEXT NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PaymentChannel_pkey" PRIMARY KEY ("id")
);
