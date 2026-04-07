import { config } from 'dotenv';

// 加载 .env 和 .env.local（集成测试需要 ARK_API_KEY）
config({ path: '.env' });
config({ path: '.env.local', override: true });
