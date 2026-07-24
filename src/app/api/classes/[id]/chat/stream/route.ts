import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = getTokenFromRequest(req);
  if (!token) return new Response("Unauthorized", { status: 401 });

  const session = verifyToken(token);
  if (!session) return new Response("Invalid token", { status: 401 });

  const encoder = new TextEncoder();
  let lastMessageId = "";
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const sendHeartbeat = () => {
        if (!closed) {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }
      };

      const checkMessages = async () => {
        if (closed) return;
        try {
          const messages = await prisma.chatMessage.findMany({
            where: { classId: id },
            orderBy: { createdAt: "desc" },
            take: 1,
          });

          if (messages.length > 0 && messages[0].id !== lastMessageId) {
            lastMessageId = messages[0].id;
            const data = JSON.stringify(messages[0]);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        } catch {
          // ignore errors during polling
        }
      };

      const interval = setInterval(checkMessages, 2000);
      const heartbeat = setInterval(sendHeartbeat, 15000);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        clearInterval(heartbeat);
        controller.close();
      });

      checkMessages();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
