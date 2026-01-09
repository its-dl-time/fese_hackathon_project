# 📘 Smart Contract Project - Hướng Dẫn Từng Bước

> Dự án này giúp bạn phát triển, triển khai và tương tác với Smart Contract trên mạng Ethereum (hoặc các mạng tương thích EVM) một cách dễ dàng - ngay cả khi bạn chưa biết code.

---

## 📋 Mục Lục

1. [Smart Contract hoạt động như thế nào?](#-smart-contract-hoạt-động-như-thế-nào)
2. [Chuẩn bị môi trường](#-bước-1-chuẩn-bị-môi-trường)
3. [Cài đặt dự án](#-bước-2-cài-đặt-dự-án)
4. [Cấu hình bảo mật](#-bước-3-cấu-hình-bảo-mật)
5. [Lấy Private Key và ETH miễn phí](#-bước-4-lấy-private-key-và-eth-miễn-phí)
6. [Triển khai Contract lên Blockchain](#-bước-5-triển-khai-contract-lên-blockchain)
7. [Tương tác với Contract](#-bước-6-tương-tác-với-contract)
8. [Xử lý lỗi thường gặp](#-xử-lý-lỗi-thường-gặp)

---

## 🔍 Smart Contract hoạt động như thế nào?

Hãy tưởng tượng Smart Contract như một **máy bán hàng tự động** trên Blockchain:

```
┌─────────────────────────────────────────────────────┐
│  1. VIẾT CODE (Solidity)                            │
│     Như viết "công thức" cho máy bán hàng           │
└─────────────────┬───────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────┐
│  2. BIÊN DỊCH (Compile)                             │
│     Chuyển code thành ngôn ngữ máy tính hiểu        │
│     → Tạo file ABI (danh sách chức năng)            │
│     → Tạo Bytecode (mã máy)                         │
└─────────────────┬───────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────┐
│  3. KẾT NỐI VÍ                                      │
│     Provider: Cổng kết nối đến Blockchain           │
│     Wallet: Ví để ký giao dịch và trả phí gas      │
└─────────────────┬───────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────┐
│  4. TRIỂN KHAI (Deploy)                             │
│     Gửi Bytecode lên mạng → Nhận địa chỉ Contract   │
└─────────────────┬───────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────┐
│  5. TƯƠNG TÁC (Interact)                            │
│     Gọi hàm để đọc/ghi dữ liệu trên Blockchain      │
└─────────────────────────────────────────────────────┘
```

---

## 🛠 Bước 1: Chuẩn bị môi trường

### Cài đặt các công cụ cần thiết

**Windows:**
1. Tải **Node.js** từ [nodejs.org](https://nodejs.org) (chọn bản LTS)
2. Tải **Git** từ [git-scm.com](https://git-scm.com)
3. Cài đặt **MetaMask** extension cho Chrome/Firefox

**macOS/Linux:**
```bash
# Cài Node.js qua Homebrew (macOS)
brew install node

# Hoặc qua apt (Ubuntu/Debian)
sudo apt install nodejs npm

# Cài Git
brew install git  # macOS
sudo apt install git  # Linux
```

### Kiểm tra cài đặt thành công

Mở Terminal/Command Prompt và chạy:

```bash
node --version   # Phải hiện v18.x.x trở lên
npm --version    # Phải hiện 9.x.x trở lên
git --version    # Phải hiện git version 2.x.x
```

---

## 📦 Bước 2: Cài đặt dự án

### Tải code về máy

```bash
# Di chuyển đến thư mục bạn muốn lưu dự án
cd Desktop

# Clone dự án (hoặc tải ZIP từ GitHub)
git clone <link-repository-cua-ban>
cd smart-contract-project
```

### Cài đặt thư viện

```bash
# Cài tất cả thư viện cần thiết (chờ 1-2 phút)
npm install
```

**Giải thích:** Lệnh này sẽ tải về tất cả các công cụ cần thiết như Hardhat, Ethers.js, v.v.

---

## 🔐 Bước 3: Cấu hình bảo mật

### Tạo file `.env`

File này chứa thông tin nhạy cảm như Private Key. **TUYỆT ĐỐI không chia sẻ file này!**

**Cách tạo:**

1. Tạo file mới tên `.env` ở thư mục gốc dự án
2. Copy nội dung sau vào:

```env
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia.infura.io/v3/your_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

3. **Chưa điền gì cả!** Bạn sẽ điền ở bước tiếp theo.

---

## 🔑 Bước 4: Lấy Private Key và ETH miễn phí

### 4.1. Lấy Private Key từ MetaMask

> ⚠️ **CẢNH BÁO:** Private Key giống như mật khẩu ngân hàng. Không bao giờ chia sẻ cho ai!

**Hướng dẫn chi tiết:**

```
1. Mở MetaMask trên trình duyệt
   ↓
2. Click vào dấu 3 chấm (⋮) ở góc phải trên
   ↓
3. Chọn "Account Details" (Chi tiết tài khoản)
   ↓
4. Click "Show Private Key" (Hiện khóa riêng tư)
   ↓
5. Nhập mật khẩu MetaMask
   ↓
6. Copy chuỗi ký tự (bắt đầu bằng 0x...)
   ↓
7. Dán vào PRIVATE_KEY trong file .env
```

**Ví dụ:**
```env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 4.2. Lấy ETH miễn phí (Testnet)

Để triển khai Smart Contract, bạn cần ETH để trả phí gas. Trên mạng thử nghiệm, bạn có thể xin miễn phí!

**Các nguồn Faucet uy tín:**

| Mạng | Website Faucet |
|------|----------------|
| Sepolia | [sepoliafaucet.com](https://sepoliafaucet.com) |
| Sepolia | [faucets.chain.link](https://faucets.chain.link) |
| BNB Testnet | [testnet.bnbchain.org/faucet-smart](https://testnet.bnbchain.org/faucet-smart) |

**Hướng dẫn xin ETH:**

```
1. Mở MetaMask, copy địa chỉ ví (Public Address)
   Ví dụ: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
   ↓
2. Vào một trong các website Faucet ở trên
   ↓
3. Dán địa chỉ ví vào ô "Wallet Address"
   ↓
4. Hoàn thành Captcha (nếu có)
   ↓
5. Click "Send Me ETH"
   ↓
6. Chờ 1-3 phút, kiểm tra ví MetaMask
```

### 4.3. Lấy RPC URL

RPC URL là cổng kết nối đến Blockchain. Bạn có thể dùng dịch vụ miễn phí:

**Cách lấy từ Infura:**

```
1. Truy cập infura.io → Sign Up (miễn phí)
   ↓
2. Tạo Project mới → Chọn "Web3 API"
   ↓
3. Copy đường dẫn Sepolia Endpoint
   Ví dụ: https://sepolia.infura.io/v3/abc123xyz...
   ↓
4. Dán vào RPC_URL trong file .env
```

**Hoặc dùng RPC công khai:**
```env
RPC_URL=https://eth-sepolia.public.blastapi.io
```

### 4.4. File `.env` hoàn chỉnh

```env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC_URL=https://sepolia.infura.io/v3/abc123xyz
ETHERSCAN_API_KEY=  # Có thể để trống nếu chưa cần verify contract
```

---

## 🚀 Bước 5: Triển khai Contract lên Blockchain

Có 2 cách triển khai. Nếu bạn mới bắt đầu, hãy dùng **Cách 1**.

### ✅ Cách 1: Deploy qua Hardhat (Khuyên dùng)

**Phù hợp:** Người mới, test nhanh trên Local hoặc Testnet

**Lệnh triển khai:**

```bash
# Test trên mạng local (không tốn tiền thật)
npx hardhat run scripts/deploy.ts --network localhost

# Triển khai lên Sepolia Testnet
npx hardhat run scripts/deploy.ts --network sepolia
```

**Kết quả:**
```
Deploying contract...
Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Deploy thành công!
```

💾 **LƯU LẠI ĐỊA CHỈ CONTRACT NÀY!** Bạn sẽ cần nó để tương tác sau này.

### 🔧 Cách 2: Deploy Raw (Nâng cao)

**Phù hợp:** Tích hợp vào hệ thống backend, automation

```bash
npx ts-node scripts/deploy.system.ts
```

Script này kết nối trực tiếp với RPC mà không qua Hardhat.

---

## 💬 Bước 6: Tương tác với Contract

### 6.1. Chạy mô phỏng (Không tốn tiền)

Trước khi tương tác thật, hãy test trên môi trường ảo:

```bash
npx hardhat run scripts/simulate.ts
```

**Kết quả mẫu:**
```
Simulating contract interactions...
✓ Calling function setGreeting("Hello Blockchain")
✓ Reading greeting: "Hello Blockchain"
✓ Simulation completed successfully!
```

### 6.2. Tương tác thật trên Blockchain

**Bước 1:** Mở file `scripts/interact_live.ts`

**Bước 2:** Tìm dòng:
```typescript
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

**Bước 3:** Thay bằng địa chỉ contract bạn đã deploy ở Bước 5

**Bước 4:** Chạy lệnh:
```bash
npx ts-node scripts/interact_live.ts
```

**Kết quả:**
```
Interacting with contract at 0x5FbDB...
Transaction sent: 0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c
✅ Transaction confirmed!
View on Etherscan: https://sepolia.etherscan.io/tx/0x9b8c...
```

### 6.3. Kiểm tra giao dịch trên Etherscan

```
1. Copy Transaction Hash (TxHash) từ terminal
   ↓
2. Mở sepolia.etherscan.io
   ↓
3. Dán TxHash vào ô tìm kiếm
   ↓
4. Xem chi tiết: Status (Success/Fail), Gas Used, Input Data
```

---

## ⚠️ Xử lý lỗi thường gặp

### ❌ Lỗi: "Insufficient funds for gas"

**Nguyên nhân:** Ví không đủ ETH để trả phí giao dịch

**Giải pháp:**
```
1. Kiểm tra số dư ví trên MetaMask
2. Vào Faucet xin thêm ETH (Bước 4.2)
3. Đảm bảo đang kết nối đúng mạng (Testnet, không phải Mainnet)
```

---

### ❌ Lỗi: "Nonce too low"

**Nguyên nhân:** Có giao dịch cũ đang bị treo hoặc nonce bị lệch

**Giải pháp:**
```
1. Mở MetaMask
2. Settings → Advanced → Reset Account
3. Thử deploy lại
```

---

### ❌ Lỗi: "ProviderError: HttpProviderError"

**Nguyên nhân:** Kết nối RPC bị lỗi hoặc API Key sai

**Giải pháp:**
```
1. Kiểm tra RPC_URL trong file .env
2. Thử đổi sang RPC công khai:
   RPC_URL=https://eth-sepolia.public.blastapi.io
3. Nếu dùng Infura/Alchemy, kiểm tra API Key còn hạn không
```

---

### ❌ Lỗi: "Contract has not been deployed to detected network"

**Nguyên nhân:** Bạn deploy trên mạng A nhưng interact trên mạng B

**Giải pháp:**
```
1. Kiểm tra lại địa chỉ Contract Address trong interact_live.ts
2. Đảm bảo đang dùng cùng mạng (cùng RPC_URL)
3. Deploy lại nếu cần
```

---

### ❌ Lỗi biên dịch (Compile Error)

**Nguyên nhân:** Phiên bản Solidity không khớp

**Giải pháp:**
```
1. Mở hardhat.config.ts
2. Tìm dòng:
   solidity: "0.8.20"
3. Mở file .sol, kiểm tra dòng:
   pragma solidity ^0.8.20;
4. Đảm bảo 2 phiên bản này khớp nhau
```

---

## 📚 Thuật ngữ cần biết

| Thuật ngữ | Giải thích |
|-----------|-----------|
| **Smart Contract** | Chương trình chạy tự động trên Blockchain |
| **Deploy** | Triển khai contract lên mạng |
| **Gas Fee** | Phí giao dịch (trả bằng ETH/BNB) |
| **Private Key** | Khóa bí mật để ký giao dịch (tuyệt mật!) |
| **Public Address** | Địa chỉ ví công khai (có thể chia sẻ) |
| **ABI** | Danh sách các hàm trong contract |
| **Testnet** | Mạng thử nghiệm (ETH miễn phí) |
| **Mainnet** | Mạng chính thức (ETH thật, có giá trị) |
| **RPC** | Cổng kết nối đến Blockchain |
| **Transaction Hash** | Mã định danh giao dịch |

---

## 🆘 Cần hỗ trợ?

- **Xem log chi tiết:** Chạy lệnh với flag `--verbose`
  ```bash
  npx hardhat run scripts/deploy.ts --network sepolia --verbose
  ```

- **Kiểm tra cấu hình mạng:** Xem file `hardhat.config.ts`

- **Xóa cache:** Nếu code thay đổi mà không chạy
  ```bash
  npx hardhat clean
  npm install
  ```

---

## 🎉 Chúc mừng!

Bạn đã hoàn thành toàn bộ quy trình từ cài đặt đến tương tác với Smart Contract. Giờ đây bạn có thể:

- ✅ Deploy contract lên Blockchain
- ✅ Tương tác với contract đã deploy
- ✅ Kiểm tra giao dịch trên Etherscan
- ✅ Xử lý các lỗi cơ bản
----