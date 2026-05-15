import { useEffect, useState, type FC } from "react";
import Slideshow, { type Slide } from "../Shared/Slideshow";
import FeaturedShops, { type Shop } from "../layouts/FeaturedShops";
import { apiFetch } from "../../services/api";

const HomePage: FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHomepage = async () => {
      try {
        const [slidesRes, featuredRes] = await Promise.all([
          apiFetch("/api/homepage-slides"),
          apiFetch("/api/featured-shops"),
        ]);

        if (!slidesRes.ok) {
          throw new Error("Failed to load homepage slides");
        }

        if (!featuredRes.ok) {
          throw new Error("Failed to load featured shops");
        }

        const slidesData = await slidesRes.json();
        const featuredData = await featuredRes.json();

        if (!isMounted) return;

        setSlides(
          Array.isArray(slidesData)
            ? slidesData
                .filter((slide: any) => slide?.image?.url)
                .map((slide: any) => ({
                  image: slide.image.url,
                  link: "/",
                  alt: slide.image.alt || "Homepage slide",
                }))
            : []
        );

        setFeaturedShops(
          Array.isArray(featuredData)
            ? featuredData
                .filter(
                  (item: any) =>
                    item?.shopId?._id &&
                    item?.shopId?.name &&
                    item?.shopId?.slug &&
                    (item?.image?.url || item?.shopId?.logo?.url)
                )
                .map((item: any) => ({
                  id: item.shopId._id,
                  name: item.shopId.name,
                  logo: item.image?.url || item.shopId?.logo?.url,
                  link: `/businesses/${item.shopId.slug}`,
                }))
            : []
        );
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage("Homepage content is unavailable right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadHomepage();

    return () => {
      isMounted = false;
    };
  }, []);

  return(
        <main className="flex-grow">
            <Slideshow slides={slides} />
            {isLoading ? (
              <section className="py-12 text-center text-gray-500">
                Loading featured shops...
              </section>
            ) : null}
            {errorMessage ? (
              <section className="py-4 text-center text-sm text-red-600">
                {errorMessage}
              </section>
            ) : null}
            {!isLoading && featuredShops.length > 0 ? (
              <FeaturedShops shops={featuredShops} />
            ) : null}
            {!isLoading && !errorMessage && featuredShops.length === 0 ? (
              <section className="py-12 text-center text-gray-500">
                No featured shops are available yet.
              </section>
            ) : null}
      </main>
    );
}

export default HomePage;
