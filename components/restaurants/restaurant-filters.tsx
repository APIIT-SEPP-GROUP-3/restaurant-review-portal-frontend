import { DiscoverySearch, DiscoverySearchField, DiscoverySortField } from "@/components/ui/discovery-search";
import type { RestaurantCategory, RestaurantSearchParams } from "@/types/restaurant";

interface RestaurantFiltersProps {
  categories: RestaurantCategory[];
  filters: RestaurantSearchParams;
}

export function RestaurantFilters({ categories, filters }: RestaurantFiltersProps) {
  return <DiscoverySearch action="/restaurants" label="Search restaurants" sorting={<>
    <DiscoverySortField label="Sort by"><select name="sortBy" defaultValue={filters.sortBy ?? "name"}><option value="name">Name</option><option value="city">City</option><option value="createdAt">Newest</option></select></DiscoverySortField>
    <DiscoverySortField label="Order"><select name="sortOrder" defaultValue={filters.sortOrder ?? "asc"}><option value="asc">Ascending</option><option value="desc">Descending</option></select></DiscoverySortField>
  </>}>
    <DiscoverySearchField label="What are you craving?" wide><input name="search" type="search" defaultValue={filters.search} placeholder="Restaurant, cuisine, or dish" /></DiscoverySearchField>
    <DiscoverySearchField label="Where?"><input name="city" type="text" defaultValue={filters.city} placeholder="Any city" /></DiscoverySearchField>
    <DiscoverySearchField label="Category"><select name="categoryId" defaultValue={filters.categoryId?.toString() ?? ""}><option value="">All categories</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></DiscoverySearchField>
  </DiscoverySearch>;
}
