-- CreateTable
CREATE TABLE "Country" (
    "iso2" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataAllowanceMB" INTEGER NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "priceAmount" DECIMAL NOT NULL,
    "priceCurrency" TEXT NOT NULL,
    "priceUsd" DECIMAL NOT NULL,
    "pricePerGBUsd" DECIMAL NOT NULL,
    "hotspotAllowed" BOOLEAN,
    "speedCapMbps" INTEGER,
    "roamingRegion" TEXT,
    "purchaseUrl" TEXT NOT NULL,
    "affiliateLink" TEXT,
    "lastCheckedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Plan_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanCountry" (
    "planId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    PRIMARY KEY ("planId", "countryId"),
    CONSTRAINT "PlanCountry_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlanCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("iso2") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_slug_key" ON "Provider"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");
