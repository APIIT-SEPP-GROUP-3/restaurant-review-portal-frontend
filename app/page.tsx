import { AboutSection } from "@/components/home/about-section";
import { FeaturedMenuItems } from "@/components/home/featured-menu-items";
import { FeaturedRestaurants } from "@/components/home/featured-restaurants";
import { HeroSection } from "@/components/home/hero-section";
import { getPublicMenuItems } from "@/services/menu-service";
import { getRestaurants } from "@/services/restaurant-service";
import type { PublicMenuItem } from "@/types/menu";
import type { RestaurantSummary } from "@/types/restaurant";

interface HomeData {
  restaurants: RestaurantSummary[];
  menuItems: PublicMenuItem[];
  restaurantCount: number;
  menuItemCount: number;
  restaurantError: string;
  menuError: string;
}

async function loadHomeData(): Promise<HomeData> {
  const [restaurantResult, menuResult] = await Promise.allSettled([
    getRestaurants({ page: 1, limit: 3, sortBy: "createdAt", sortOrder: "desc" }),
    getPublicMenuItems({
      page: 1,
      limit: 3,
      isAvailable: true,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
  ]);

  return {
    restaurants:
      restaurantResult.status === "fulfilled"
        ? restaurantResult.value.restaurants
        : [],
    menuItems:
      menuResult.status === "fulfilled" ? menuResult.value.menuItems : [],
    restaurantCount:
      restaurantResult.status === "fulfilled"
        ? restaurantResult.value.pagination.total
        : 0,
    menuItemCount:
      menuResult.status === "fulfilled" ? menuResult.value.pagination.total : 0,
    restaurantError:
      restaurantResult.status === "rejected"
        ? "Restaurants are temporarily unavailable. Please try again later."
        : "",
    menuError:
      menuResult.status === "rejected"
        ? "Menu items are temporarily unavailable. Please try again later."
        : "",
  };
}

export default async function Home() {
  await connection();
  const data = await loadHomeData();

  return (
    <>
      <HeroSection
        featuredRestaurant={data.restaurants[0]}
        restaurantCount={data.restaurantCount}
        menuItemCount={data.menuItemCount}
      />
      <FeaturedRestaurants
        restaurants={data.restaurants}
        errorMessage={data.restaurantError}
      />
      <FeaturedMenuItems
        menuItems={data.menuItems}
        errorMessage={data.menuError}
      />
      <AboutSection />
    </>
  );
}
import { connection } from "next/server";
