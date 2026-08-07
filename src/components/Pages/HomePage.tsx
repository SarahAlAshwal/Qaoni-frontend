import { useEffect, useRef, useState, type FC } from "react";
import Slideshow, { type Slide } from "../Shared/Slideshow";
import FeaturedShops, { type Shop } from "../layouts/FeaturedShops";
import FeaturedCategories, { type CategoryTeaser } from "../layouts/FeaturedCategories";
import { apiFetch } from "../../services/api";

const CACHE_KEY = "qaoni_homepage_v2";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function readCache(): { slides: Slide[]; featuredShops: Shop[]; categories: CategoryTeaser[] } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { slides, featuredShops, categories, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return { slides, featuredShops, categories };
  } catch {
    return null;
  }
}

function writeCache(slides: Slide[], featuredShops: Shop[], categories: CategoryTeaser[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ slides, featuredShops, categories, timestamp: Date.now() })
    );
  } catch {}
}

function ShopsSkeleton() {
  return (
    <section className="py-12">
      <div className="h-7 w-52 bg-gray-200 animate-pulse rounded mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-gray-200 animate-pulse h-40" />
        ))}
      </div>
    </section>
  );
}

const HomePage: FC = () => {
  const cache = useRef(readCache());
  const [slides, setSlides] = useState<Slide[]>(cache.current?.slides ?? []);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>(cache.current?.featuredShops ?? []);
  const [categories, setCategories] = useState<CategoryTeaser[]>(cache.current?.categories ?? []);
  const [isLoading, setIsLoading] = useState(cache.current === null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHomepage = async () => {
      try {
        const [slidesRes, featuredRes, categoriesRes] = await Promise.all([
          apiFetch("/api/homepage-slides"),
          apiFetch("/api/featured-shops"),
          apiFetch("/api/categories"),
        ]);

        if (!slidesRes.ok) throw new Error("Failed to load homepage slides");
        if (!featuredRes.ok) throw new Error("Failed to load featured shops");
        if (!categoriesRes.ok) throw new Error("Failed to load categories");

        const slidesData = await slidesRes.json();
        const featuredData = await featuredRes.json();
        const categoriesData = await categoriesRes.json();

        if (!isMounted) return;

        const newSlides: Slide[] = Array.isArray(slidesData)
          ? slidesData
              .filter((slide: any) => slide?.image?.url)
              .map((slide: any) => ({
                image: slide.image.url,
                link: "/",
                alt: slide.image.alt || "Homepage slide",
              }))
          : [];

        const newFeaturedShops: Shop[] = Array.isArray(featuredData)
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
          : [];

        const newCategories: CategoryTeaser[] = Array.isArray(categoriesData)
          ? categoriesData
              .filter(
                (category: any) =>
                  typeof category?.name === "string" &&
                  typeof category?.slug === "string" &&
                  typeof category?.shopCount === "number" &&
                  category.shopCount > 0
              )
              .map((category: any) => ({
                name: category.name,
                slug: category.slug,
                shopCount: category.shopCount,
              }))
              .sort((a: CategoryTeaser, b: CategoryTeaser) => b.shopCount - a.shopCount)
          : [];

        setSlides(newSlides);
        setFeaturedShops(newFeaturedShops);
        setCategories(newCategories);
        writeCache(newSlides, newFeaturedShops, newCategories);
      } catch (error) {
        console.error(error);
        if (isMounted && cache.current === null) {
          setErrorMessage("Homepage content is unavailable right now.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadHomepage();
    return () => { isMounted = false; };
  }, []);

  return (
    <main className="flex-grow">
      <title>Qaoni | Discover Local Businesses in Your Community</title>
      <meta name="description" content="Qaoni is the universe of small businesses — discover and support local shops, artisans, and service providers all in one place." />
      <link rel="canonical" href="https://www.qaoni.ca/" />
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <Slideshow slides={slides} isLoading={isLoading} />
      </div>
      {isLoading ? (
        <div className="container mx-auto px-6">
          <ShopsSkeleton />
        </div>
      ) : errorMessage ? (
        <section className="py-4 text-center text-sm text-red-600">{errorMessage}</section>
      ) : (
        <>
          <FeaturedCategories categories={categories} />
          {featuredShops.length > 0 ? (
            <FeaturedShops shops={featuredShops} />
          ) : (
            <section className="py-12 text-center text-gray-500">
              No featured shops are available yet.
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default HomePage;
