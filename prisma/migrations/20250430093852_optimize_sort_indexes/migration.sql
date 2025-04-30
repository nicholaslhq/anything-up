-- CreateIndex
CREATE INDEX "Post_type_expiredAt_createdAt_upVotes_downVotes_idx" ON "Post"("type", "expiredAt", "createdAt", "upVotes", "downVotes");

-- CreateIndex
CREATE INDEX "Vote_userId_createdAt_idx" ON "Vote"("userId", "createdAt");
