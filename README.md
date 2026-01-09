# Smart Contract Project - Hướng Dẫn Toàn Diện

Dự án này cung cấp bộ source code hoàn chỉnh để phát triển, triển khai (deploy), mô phỏng (simulate) và tương tác (interact) với Smart Contract trên mạng lưới Ethereum (hoặc các mạng tương thích EVM).


Cách Code hoạt động (Architecture)
Quy trình hoạt động của bộ mã nguồn này như sau:

-- Biên dịch (Compile): Code Solidity (.sol) được Hardhat biên dịch thành file JSON (Artifacts) chứa ABI (giao diện hàm) và Bytecode (mã máy). 
Kết nối (Provider & Signer): 
-- Provider: Là cổng kết nối tới Blockchain (thông qua RPC URL). 
-- Wallet/Signer: Là ví chứa Private Key để ký xác nhận giao dịch (trả phí gas). 
Triển khai (Deploy): 
-- Code gửi một transaction đặc biệt chứa Bytecode lên mạng lưới. 
-- Mạng lưới xác nhận và trả về địa chỉ Contract mới (Contract Address). 
Tương tác (Interact): 
-- Code dùng Contract Address + ABI để biết contract có hàm gì. 
-- Gửi transaction để thay đổi dữ liệu (tốn gas) hoặc gọi call để đọc dữ liệu (miễn phí).


## Cài đặt Môi trường (Installation)

Trước khi bắt đầu, hãy đảm bảo máy tính đã cài đặt Node.js và Git.

-- Chạy lệnh sau để cài đặt các thư viện cần thiết:
```bash
npm install
# hoặc
yarn install
Cấu hình Môi trường (.env)
Bạn cần tạo một file .env tại thư mục gốc để chứa các thông tin bảo mật. Tuyệt đối không push file này lên Git.

-- Tạo file .env với nội dung mẫu:

Đoạn mã

PRIVATE_KEY=your_private_key_here
RPC_URL=[https://sepolia.infura.io/v3/your_api_key](https://sepolia.infura.io/v3/your_api_key)
ETHERSCAN_API_KEY=your_etherscan_api_key
Hướng dẫn lấy Key và Công cụ (MetaMask, Faucet, Scan)
Phần này hướng dẫn cách chuẩn bị ví và nguyên liệu để chạy trên Testnet/Mainnet.

1. Lấy Private Key từ MetaMask
-- Mở tiện ích MetaMask trên trình duyệt. -- Bấm vào dấu 3 chấm ở góc phải -> Chọn Account Details (Chi tiết tài khoản). -- Chọn Show Private Key (Hiện khóa riêng tư). -- Nhập mật khẩu ví MetaMask để xác nhận. -- Copy chuỗi ký tự đó và dán vào biến PRIVATE_KEY trong file .env. -- Cảnh báo: Không bao giờ chia sẻ Private Key cho bất kỳ ai.

2. Lấy ETH Testnet (Faucet)
Để deploy lên mạng thử nghiệm (như Sepolia, Goerli, BNB Testnet), bạn cần có token để trả phí gas. -- Truy cập các trang Faucet uy tín (ví dụ: sepoliafaucet.com, alchemy.com/faucets, faucets.chain.link). -- Dán địa chỉ ví công khai (Public Address) của bạn vào. -- Bấm "Send Me ETH". -- Chờ vài phút để tiền về ví.

3. Kiểm tra giao dịch trên Scan
Khi deploy hoặc tương tác xong, bạn sẽ nhận được một Transaction Hash (TxHash). -- Truy cập Block Explorer tương ứng với mạng bạn dùng (ví dụ: sepolia.etherscan.io cho Sepolia, bscscan.com cho BNB Chain). -- Dán TxHash hoặc địa chỉ Contract vào ô tìm kiếm. -- Bạn sẽ thấy trạng thái giao dịch (Success/Fail) và dữ liệu chi tiết.

Hướng dẫn Deploy (Triển khai)
Dự án hỗ trợ 2 phương thức deploy: thông qua Hardhat Plugin và Deploy thô (Raw).

Cách 1: Deploy qua Hardhat (Dùng cho Local/Development)
Sử dụng file deploy.ts. Cách này tận dụng hệ sinh thái Hardhat, thích hợp để test nhanh trên mạng Localhost hoặc Testnet đã cấu hình trong hardhat.config.ts.

-- Chạy node local (nếu test local):

Bash

npx hardhat node
-- Mở terminal mới và chạy lệnh deploy:

Bash

npx hardhat run scripts/deploy.ts --network localhost
-- Lưu lại địa chỉ Contract vừa được in ra terminal.

Cách 2: Deploy Raw (Dùng cho Custom/System Integration)
Sử dụng file deploy.system.ts. Cách này sử dụng thư viện ethers hoặc web3 trực tiếp để tạo transaction deploy mà không phụ thuộc vào hre (Hardhat Runtime Environment). Thường dùng khi tích hợp vào backend server hoặc tool riêng.

-- Chạy lệnh:

Bash

npx ts-node scripts/deploy.system.ts
-- Script này sẽ tự động đọc PRIVATE_KEY và RPC_URL từ file .env để kết nối và đẩy contract lên mạng.

Hướng dẫn Tương tác và Mô phỏng
1. Chạy Mô phỏng (Simulation) - simulate.ts
Script này chạy toàn bộ quy trình logic trên môi trường Local hoặc Forking mà không tốn tiền thật. Dùng để kiểm tra logic code có chạy đúng hay không.

-- Chức năng: Deploy contract ảo -> Gọi hàm -> In kết quả -> Reset. -- Lệnh chạy:

Bash

npx hardhat run scripts/simulate.ts
2. Tương tác On-Chain (Live) - interact_live.ts
Script này dùng để gọi hàm trên Smart Contract đã được deploy trên mạng thật (Testnet/Mainnet).

-- Bước 1: Mở file interact_live.ts, tìm biến CONTRACT_ADDRESS và thay bằng địa chỉ contract bạn đã deploy ở bước trước. -- Bước 2: Chạy lệnh:

Bash

npx ts-node scripts/interact_live.ts
-- Kết quả sẽ trả về Transaction Hash thực tế trên Blockchain.

Các lỗi thường gặp và Cách xử lý (Troubleshooting)
1. Lỗi "Insufficient funds for gas * price + value"
-- Nguyên nhân: Ví của bạn không đủ ETH/BNB để trả phí giao dịch. -- Xử lý: Vào Faucet để xin thêm token hoặc chuyển tiền từ ví khác sang. Kiểm tra lại xem bạn đang kết nối đúng mạng (Testnet hay Mainnet) chưa.

2. Lỗi "Nonce too low" hoặc "Replacement transaction underpriced"
-- Nguyên nhân: Có một giao dịch trước đó đang bị treo (pending) hoặc nonce của ví bị lệch so với mạng lưới. -- Xử lý: -- Reset lại ví MetaMask (Cài đặt -> Nâng cao -> Xóa dữ liệu tab hoạt động). -- Hoặc chờ giao dịch cũ hoàn tất.

3. Lỗi "ProviderError: HttpProviderError"
-- Nguyên nhân: Kết nối tới RPC Node bị lỗi (mạng lag, hoặc API Key của Infura/Alchemy bị hết hạn/sai). -- Xử lý: Kiểm tra lại đường dẫn RPC_URL trong file .env. Thử đổi sang một RPC public khác.

4. Lỗi "Contract has not been deployed to detected network"
-- Nguyên nhân: Bạn đang chạy script interact trên mạng A, nhưng địa chỉ contract bạn điền vào lại là địa chỉ deploy trên mạng B (hoặc Localhost). -- Xử lý: Deploy lại contract trên đúng mạng bạn muốn tương tác, sau đó cập nhật lại địa chỉ Contract Address vào file code.

5. Lỗi biên dịch (Compile Error)
-- Nguyên nhân: Phiên bản Solidity trong file config không khớp với code. -- Xử lý: Kiểm tra hardhat.config.ts và đảm bảo phiên bản solidity (ví dụ: "0.8.20") tương thích với pragma trong file .sol.