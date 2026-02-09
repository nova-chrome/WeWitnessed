import { ImageResponse } from "next/og";
import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";

export const alt = "WeWitnessed — Wedding Photo Gallery";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await fetchQuery(api.events.getOgData, { slug });

  if (!event) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 200,
              color: "#a855f7",
              marginBottom: 16,
              display: "flex",
            }}
          >
            W
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.6)",
              display: "flex",
            }}
          >
            Event not found
          </div>
        </div>
      ),
      { ...size },
    );
  }

  const photoLabel =
    event.photoCount === 0
      ? "No photos yet"
      : event.photoCount === 1
        ? "1 photo captured"
        : `${event.photoCount} photos captured`;

  const dateLabel = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
        }}
      >
        {event.coverPhotoUrl ? (
          <img
            src={event.coverPhotoUrl}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              display: "flex",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: event.coverPhotoUrl
              ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)"
              : "transparent",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 200,
                color: "#a855f7",
                display: "flex",
              }}
            >
              W
            </div>
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                display: "flex",
              }}
            >
              WeWitnessed
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 300,
                color: "white",
                lineHeight: 1.1,
                display: "flex",
              }}
            >
              {event.name}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  color: "rgba(255,255,255,0.8)",
                  display: "flex",
                }}
              >
                {photoLabel}
              </div>

              {dateLabel && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.4)",
                      display: "flex",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 22,
                      color: "rgba(255,255,255,0.6)",
                      display: "flex",
                    }}
                  >
                    {dateLabel}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                width: 60,
                height: 3,
                backgroundColor: "#a855f7",
                borderRadius: 2,
                marginTop: 4,
                display: "flex",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
