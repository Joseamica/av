-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'manager', 'waiter', 'user');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'card', 'debitCard', 'paypal', 'applePay', 'other');

-- CreateEnum
CREATE TYPE "StatusMethod" AS ENUM ('pending', 'accepted', 'rejected', 'received');

-- CreateEnum
CREATE TYPE "NotificationMethod" AS ENUM ('email', 'sms', 'push', 'whatsapp');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL DEFAULT 'cllb3d9b90003cedclcthud41',
    "access" INTEGER,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "updated" TEXT,
    "created" TEXT,
    "storeTimeZone" TEXT,
    "region" TEXT,
    "logo" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "adminEmail" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "extraAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "timezone" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "language" TEXT DEFAULT 'en',
    "image" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "rating_quantity" INTEGER,
    "cuisine" TEXT NOT NULL,
    "wifiName" TEXT,
    "wifipwd" TEXT,
    "coordinates" JSONB,
    "open" INTEGER,
    "close" INTEGER,
    "tipsPercentages" DECIMAL(65,30)[] DEFAULT ARRAY[10, 12, 15]::DECIMAL(65,30)[],
    "paymentMethods" TEXT[] DEFAULT ARRAY['cash', 'card']::TEXT[],
    "social" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created" TEXT,
    "updated" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "floorId" TEXT,
    "locationId" TEXT,
    "seats" INTEGER,
    "order_in_progress" BOOLEAN NOT NULL DEFAULT false,
    "branchId" TEXT NOT NULL,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "currency" TEXT,
    "fromHour" DECIMAL(65,30),
    "toHour" DECIMAL(65,30),
    "allday" BOOLEAN,
    "branchId" TEXT NOT NULL,
    "personalizeMenu" BOOLEAN DEFAULT false,
    "image" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availabilities" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "startTime" TEXT,
    "endTime" TEXT,
    "menuId" TEXT,
    "menuCategoryId" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "Availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "pdf" BOOLEAN DEFAULT false,
    "branchId" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "plu" TEXT,
    "image" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "available" BOOLEAN NOT NULL,
    "menuCategoryId" TEXT,
    "branchId" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "tip" DECIMAL(65,30),
    "paid" BOOLEAN,
    "total" DECIMAL(65,30),
    "paidDate" TIMESTAMP(3),
    "creationDate" TIMESTAMP(3) NOT NULL,
    "orderedDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN,
    "tableId" TEXT,
    "branchId" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "plu" TEXT,
    "name" TEXT,
    "image" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "creationDate" TEXT,
    "quantity" INTEGER NOT NULL,
    "orderId" TEXT,
    "menuItemId" TEXT,
    "comments" TEXT,
    "paid" BOOLEAN DEFAULT false,
    "paidBy" TEXT,
    "stock" INTEGER,
    "feedbackId" TEXT,
    "activeOnOrder" BOOLEAN,
    "rating" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modifiers" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "mandatorySelected" BOOLEAN,
    "onlyOne" BOOLEAN,
    "multiSelect" BOOLEAN,
    "mandatoryOneMultiSelect" BOOLEAN,
    "extraPrice" DECIMAL(65,30),
    "modifierGroupId" TEXT,
    "cartItemId" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "Modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModifierGroup" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'radio',
    "name" TEXT,
    "plu" TEXT,
    "max" INTEGER,
    "min" INTEGER,
    "multiMax" INTEGER,
    "multiply" INTEGER,
    "nameTranslations" JSONB,
    "minSelectionAllowed" INTEGER,
    "maxSelectionAllowed" INTEGER,
    "isMandatory" BOOLEAN,
    "cartItemId" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "ModifierGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "phone" INTEGER,
    "access" INTEGER,
    "email" TEXT,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "color" TEXT,
    "tip" DECIMAL(65,30),
    "paid" DECIMAL(65,30),
    "total" DECIMAL(65,30),
    "orderId" TEXT,
    "role" "Role",
    "branchId" TEXT,
    "tableId" TEXT,
    "restaurantId" TEXT,
    "adminId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "branchId" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "comments" TEXT,
    "creationDate" TEXT,
    "branchId" TEXT,
    "tableId" TEXT,
    "userId" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "tip" DECIMAL(65,30),
    "total" DECIMAL(65,30),
    "branchId" TEXT,
    "orderId" TEXT,
    "userId" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "NotificationMethod" NOT NULL,
    "recipient" TEXT,
    "sender" TEXT,
    "status" "StatusMethod" NOT NULL,
    "message" TEXT NOT NULL,
    "branchId" TEXT,
    "orderId" TEXT,
    "userId" TEXT,
    "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41',
    "employeeId" TEXT,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverect" (
    "id" TEXT NOT NULL,
    "deliverectToken" TEXT,
    "deliverectExpiration" INTEGER,

    CONSTRAINT "Deliverect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MenuToMenuCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MenuItemToModifierGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CartItemToModifiers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CartItemToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EmployeeToTable" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EmployeeToFeedback" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Availabilities_dayOfWeek_startTime_endTime_menuId_key" ON "Availabilities"("dayOfWeek", "startTime", "endTime", "menuId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tableId_key" ON "Order"("tableId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_MenuToMenuCategory_AB_unique" ON "_MenuToMenuCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_MenuToMenuCategory_B_index" ON "_MenuToMenuCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MenuItemToModifierGroup_AB_unique" ON "_MenuItemToModifierGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_MenuItemToModifierGroup_B_index" ON "_MenuItemToModifierGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CartItemToModifiers_AB_unique" ON "_CartItemToModifiers"("A", "B");

-- CreateIndex
CREATE INDEX "_CartItemToModifiers_B_index" ON "_CartItemToModifiers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CartItemToUser_AB_unique" ON "_CartItemToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CartItemToUser_B_index" ON "_CartItemToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeToTable_AB_unique" ON "_EmployeeToTable"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeToTable_B_index" ON "_EmployeeToTable"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeToFeedback_AB_unique" ON "_EmployeeToFeedback"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeToFeedback_B_index" ON "_EmployeeToFeedback"("B");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availabilities" ADD CONSTRAINT "Availabilities_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availabilities" ADD CONSTRAINT "Availabilities_menuCategoryId_fkey" FOREIGN KEY ("menuCategoryId") REFERENCES "MenuCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availabilities" ADD CONSTRAINT "Availabilities_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_menuCategoryId_fkey" FOREIGN KEY ("menuCategoryId") REFERENCES "MenuCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modifiers" ADD CONSTRAINT "Modifiers_modifierGroupId_fkey" FOREIGN KEY ("modifierGroupId") REFERENCES "ModifierGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modifiers" ADD CONSTRAINT "Modifiers_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModifierGroup" ADD CONSTRAINT "ModifierGroup_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuToMenuCategory" ADD CONSTRAINT "_MenuToMenuCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuToMenuCategory" ADD CONSTRAINT "_MenuToMenuCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "MenuCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemToModifierGroup" ADD CONSTRAINT "_MenuItemToModifierGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemToModifierGroup" ADD CONSTRAINT "_MenuItemToModifierGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "ModifierGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToModifiers" ADD CONSTRAINT "_CartItemToModifiers_A_fkey" FOREIGN KEY ("A") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToModifiers" ADD CONSTRAINT "_CartItemToModifiers_B_fkey" FOREIGN KEY ("B") REFERENCES "Modifiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToUser" ADD CONSTRAINT "_CartItemToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToUser" ADD CONSTRAINT "_CartItemToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToTable" ADD CONSTRAINT "_EmployeeToTable_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToTable" ADD CONSTRAINT "_EmployeeToTable_B_fkey" FOREIGN KEY ("B") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToFeedback" ADD CONSTRAINT "_EmployeeToFeedback_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToFeedback" ADD CONSTRAINT "_EmployeeToFeedback_B_fkey" FOREIGN KEY ("B") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;
