-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "downVotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "upVotes" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Post_type_idx" ON "Post"("type");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Vote_post_id_idx" ON "Vote"("post_id");

-- CreateIndex
CREATE INDEX "Vote_post_id_type_idx" ON "Vote"("post_id", "type");
