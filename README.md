# AnythingUp⬆️

A minimalist, privacy-first platform for anonymous content sharing and discovery. No logins. No profiles. Just pure content.

-   **Zero commitment** - Browse and contribute without signing up
-   **True anonymity** - Your privacy is respected, always
-   **Instant access** - See what's trending right now, no login required
-   **Community-powered** - Content rises and falls based purely on votes
-   **Self-cleaning** - Inactive posts automatically expire, keeping the feed fresh
-   **Simplicity**: Intuitive interface with no unnecessary features

## 🖼️ Screenshots

Below are some screenshots of the AnythingUp in action:

![image](https://github.com/user-attachments/assets/374a9483-cd61-48d3-85e6-2e720c9be2b9)

![image](https://github.com/user-attachments/assets/9194fceb-387a-46a5-859c-a0ab13b3219f)

## 🛠️ Technology Stack

-   **Framework**: [Next.js](https://nextjs.org)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Deployment**: [Vercel](https://vercel.com/)

## ⚙️ Key Features

### Content Submission & Voting

-   Submit posts with simple forms (no accounts needed)
-   Upvote/downvote system (tracked via browser fingerprint)
-   Real-time vote counts and sorting (Hot/New/Top)

### Smart Post Expiration

-   Posts remain visible for predefined days from last interaction
-   Inactive posts automatically removed to keep content fresh
-   Voting resets the expiration timer

### Privacy-First Design

-   No personal data collection
-   Browser fingerprint used only for vote tracking
-   Clear data transparency

## ⚙️ Installation and Setup

### Prerequisites

-   Node.js v18+
-   PostgreSQL database
-   Git

### Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/nicholaslhq/anything-up.git
    cd anything-up
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    ```bash
    cp .env.example .env
    ```

    Edit `.env` with your database credentials.

4. Run database migrations:

    ```bash
    npx prisma migrate deploy
    ```

5. Start development server:

    ```bash
    npm run dev
    ```

6. Open [http://localhost:3000](http://localhost:3000) in browser.

## 🔍 Troubleshooting

### Common Issues

-   **Database errors**: Verify `.env` DATABASE_URL
-   **Migration issues**: Try `npx prisma migrate reset` (wipes data)
-   **Voting problems**: Clear browser data if votes aren't registering

### Additional Help

-   [Prisma Documentation](https://www.prisma.io/docs)
-   [Next.js Documentation](https://nextjs.org/docs)
-   [Open an issue](https://github.com/nicholaslhq/anything-up/issues)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👤 Credits

-   Built by [Nicholas Lee](https://github.com/nicholaslhq)
-   UI components from [shadcn/ui](https://ui.shadcn.com/) and [neobrutalism](https://www.neobrutalism.dev/)
-   Icons from [Lucide](https://lucide.dev/)
