import { DiscoverySearch, DiscoverySearchField, DiscoverySortField } from "@/components/ui/discovery-search";
import type { MenuItemSearchParams } from "@/types/menu";

export function MenuFilters({ filters }: { filters: MenuItemSearchParams }) {
  return <DiscoverySearch action="/menu" label="Search dishes" sorting={<>
    <DiscoverySortField label="Sort by"><select name="sortBy" defaultValue={filters.sortBy ?? "name"}><option value="name">Name</option><option value="price">Price</option><option value="createdAt">Newest</option></select></DiscoverySortField>
    <DiscoverySortField label="Order"><select name="sortOrder" defaultValue={filters.sortOrder ?? "asc"}><option value="asc">Ascending</option><option value="desc">Descending</option></select></DiscoverySortField>
  </>}>
    <DiscoverySearchField label="Find your next favourite dish" wide><input name="search" type="search" defaultValue={filters.search} placeholder="Search dishes or ingredients" /></DiscoverySearchField>
    <DiscoverySearchField label="Availability"><select name="isAvailable" defaultValue={filters.isAvailable === undefined ? "" : String(filters.isAvailable)}><option value="">All dishes</option><option value="true">Available now</option><option value="false">Unavailable</option></select></DiscoverySearchField>
  </DiscoverySearch>;
}
