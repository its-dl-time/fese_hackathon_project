import { network } from "hardhat";
import { formatEther, parseEther } from "viem";
import * as readline from "readline";

// --- CẤU HÌNH INPUT TƯƠNG TÁC ---
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    console.log("\n🚀 KHỞI TẠO MÔI TRƯỜNG SIMULATION (MỚI)...");

    // 1. Setup Wallet & Client (Hỗ trợ cả Hardhat v2 và v3)
    let viemObj;
    if ((network as any).connect) {
        // Nếu dùng Hardhat v3 (EDR)
        const conn = await (network as any).connect();
        viemObj = conn.viem;
    } else {
        // Nếu dùng Hardhat chuẩn
        const hre = require("hardhat");
        viemObj = hre.viem;
    }

    const publicClient = await viemObj.getPublicClient();
    const testClient = await viemObj.getTestClient(); // Dùng để tua thời gian
    const [admin, user] = await viemObj.getWalletClients();

    console.log(`👨‍✈️ Admin (Backend): ${admin.account.address}`);
    console.log(`jh User (Nạn nhân): ${user.account.address}`);

    // 2. DEPLOY HỆ THỐNG
    console.log("\n📦 Đang deploy contracts...");

    // Deploy Sổ cái trước
    const decisionLog = await viemObj.deployContract("DecisionLog", []);

    // Deploy Vault (kết nối với Admin và Sổ cái)
    const vault = await viemObj.deployContract("DisciplineVault", [
        admin.account.address,
        decisionLog.address
    ]);

    // BẮT TAY (Handshake)
    await decisionLog.write.setVaultAddress([vault.address]);

    console.log(`✅ DecisionLog:    ${decisionLog.address}`);
    console.log(`✅ DisciplineVault: ${vault.address}`);
    console.log("------------------------------------------------------");

    // --- VÒNG LẶP MENU ---
    while (true) {
        console.log("\n👇 CHỌN HÀNH ĐỘNG:");
        console.log("1. [SETUP] User cài đặt mức phạt & Admin nạp tiền ảo");
        console.log("2. [BACKEND] Trigger Cool-off (Chặn lệnh Panic)");
        console.log("3. [USER] Force Execute (Chấp nhận phạt tiền để đi lệnh)");
        console.log("4. [USER] Free Execute (Kiên nhẫn chờ hết giờ)");
        console.log("5. [TIME] Tua thời gian (Hack 1 tiếng)");
        console.log("6. [CHECK] Xem trạng thái ví & Lệnh treo");
        console.log("7. [LOGS] Xem Lịch sử Quyết định (Decision Log)");
        console.log("0. Thoát");

        const choice = await askQuestion("Nhập số: ");

        try {
            switch (choice.trim()) {
                case "1": // SETUP (ĐÃ CẬP NHẬT: CHO PHÉP NHẬP TAY)
                    console.log("\n--- THIẾT LẬP TÀI KHOẢN ---");

                    // A. Nhập mức phạt
                    const penaltyInput = await askQuestion("👉 Nhập mức phạt mong muốn (VND) [Mặc định 50000]: ");
                    // Nếu bấm Enter (rỗng) thì lấy 50000, ngược lại thì lấy số người dùng nhập
                    const penaltyFee = penaltyInput.trim() === "" ? 50000n : BigInt(penaltyInput);

                    await vault.write.setMyPenaltyFee([penaltyFee], { account: user.account });
                    console.log(`✅ User: Đã cam kết mức phạt ${penaltyFee}`);

                    // B. Nhập tiền nạp
                    const topUpInput = await askQuestion("👉 Nhập số tiền muốn nạp (Credit) [Mặc định 1000000]: ");
                    const topUpAmount = topUpInput.trim() === "" ? 1000000n : BigInt(topUpInput);

                    await vault.write.adminTopUpCredit([user.account.address, topUpAmount], { account: admin.account });
                    console.log(`✅ Admin: Đã nạp thành công ${topUpAmount} cho User`);
                    break;

                case "2": // TRIGGER
                    console.log("\n--- BACKEND CHẶN LỆNH ---");
                    // Chặn 60 giây, Risk 90, Lý do "Panic Sell"
                    const hash = `ORDER_${Date.now()}`;
                    await vault.write.triggerCoolOff(
                        [user.account.address, hash, 60n, 90n, "Panic Sell Detect"],
                        { account: admin.account }
                    );
                    console.log(`⛔ Đã chặn lệnh! Hash: ${hash}`);
                    console.log("User phải chờ 60s hoặc nộp phạt.");
                    break;

                case "3": // FORCE (PHẠT)
                    console.log("\n--- USER CHỌN: PHÁ RÀO (CHẤP NHẬN PHẠT) ---");
                    const balBefore = await vault.read.fiatCredit([user.account.address]);

                    await vault.write.executeForce({ account: user.account });

                    const balAfter = await vault.read.fiatCredit([user.account.address]);
                    console.log(`💰 Số dư trước: ${balBefore}`);
                    console.log(`💸 Số dư sau:   ${balAfter}`);
                    console.log(`🔥 Đã bị trừ:   ${balBefore - balAfter}`);
                    console.log("🚀 LỆNH ĐÃ ĐƯỢC ĐẨY LÊN SÀN NGAY LẬP TỨC!");
                    break;

                case "4": // FREE (CHỜ)
                    console.log("\n--- USER CHỌN: KIÊN NHẪN (MIỄN PHÍ) ---");
                    // Kiểm tra xem hết giờ chưa
                    try {
                        await vault.write.executeFree({ account: user.account });
                        console.log("✅ Thành công! Bạn đã chờ đủ thời gian. Không bị phạt.");
                    } catch (e: any) {
                        if (e.message.includes("Cool-off time not over")) {
                            console.log("❌ THẤT BẠI: Chưa hết giờ cool-off! Hãy chọn mục 5 để tua thời gian.");
                        } else {
                            console.error(e);
                        }
                    }
                    break;

                case "5": // TUA THỜI GIAN
                    console.log("\n⌛ Đang tua nhanh thời gian thêm 3600 giây...");
                    await testClient.increaseTime({ seconds: 3600 });
                    // Mine thêm 1 block để cập nhật trạng thái
                    await testClient.mine({ blocks: 1 });
                    console.log("✅ Đã tua xong! Giờ bạn có thể chọn mục 4.");
                    break;

                case "6": // CHECK STATUS
                    console.log("\n--- TRẠNG THÁI HIỆN TẠI ---");
                    const credit = await vault.read.fiatCredit([user.account.address]);
                    const pending = await vault.read.pendingOrders([user.account.address]);

                    console.log(`💰 Ví Kỷ Luật (Credit): ${credit}`);
                    console.log(`🔒 Lệnh treo:`);
                    console.log(`   - Active:    ${pending[4]}`); // Struct trả về array, index 4 là bool active
                    console.log(`   - RiskScore: ${pending[2]}`);
                    console.log(`   - Lý do:     ${pending[3]}`);
                    console.log(`   - UnlockTime:${pending[1]}`);
                    break;

                case "7": // CHECK LOGS
                    console.log("\n--- NHẬT KÝ QUYẾT ĐỊNH (ON-CHAIN) ---");
                    const history = await decisionLog.read.getUserHistory([user.account.address]);

                    if (history.length === 0) console.log("📭 Chưa có lịch sử nào.");

                    // Duyệt ngược từ mới nhất
                    for (let i = history.length - 1; i >= 0; i--) {
                        const log = history[i];
                        console.log(`\n📌 Log #${i}:`);
                        console.log(`   - Hành động: ${log.actionType}`);
                        console.log(`   - Phạt:      ${log.penaltyPaid}`);
                        console.log(`   - Risk:      ${log.riskScore}`);
                        console.log(`   - Lý do:     ${log.reason}`);
                        console.log(`   - Thời gian: ${new Date(Number(log.timestamp) * 1000).toLocaleTimeString()}`);
                    }
                    break;

                case "0":
                    console.log("👋 Bye bye!");
                    process.exit(0);

                default:
                    console.log("❌ Chọn sai, vui lòng nhập lại.");
            }
        } catch (error: any) {
            console.error("\n❌ CÓ LỖI XẢY RA:");
            // Rút gọn thông báo lỗi cho dễ nhìn
            if (error.message.includes("Insufficient credit")) console.log("=> Không đủ tiền trong ví Credit!");
            else if (error.message.includes("No pending order")) console.log("=> Không có lệnh nào đang bị treo!");
            else console.log(error.shortMessage || error.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});