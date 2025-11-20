import "dotenv/config";

export const env = {
    MONGODB_URI: ENV.MONGODB_URI,
    PORT: ENV.PORT || 3000,
    RESEND_API_KEY: ENV.RESEND_API_KEY,
    EMAIL_FROM: ENV.EMAIL_FROM,
    EMAIL_FROM_NAME: ENV.EMAIL_FROM_NAME,
    CLIENT_URL: ENV.CLIENT_URL,
    JWT_SECRET: ENV.JWT_SECRET,

};

// PORT= 3000
// MONGO_URI= mongodb+srv://de180551chauvuonghoang_db_user:8DjUD2m8QHHDut2e@cluster0.nkqrqyj.mongodb.net/CourseHubDB?appName=Cluster0
// NODE_ENV= development
// JWT_SECRET=myjwt
// RESEND_API_KEY=re_KGugkZUS_Pcx5buuwh9kxBDYNnxHYVQoY
// EMAIL_FROM="FLYUP@resend.dev"
// EMAIL_FROM_NAME="FLY UP TEAM"
// CLIENT_URL= http://locahost:5173