"use client";

import { useRef, useState } from "react";
import { MenuCategoryForm } from "@/components/management/menu-category-form";
import { MenuItemForm } from "@/components/management/menu-item-form";
import { MenuItemImages } from "@/components/management/menu-item-images";
import { Pagination, WORKSPACE_PAGE_SIZE } from "@/components/workspace/pagination";
import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { WorkspaceTable } from "@/components/workspace/workspace-table";
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs";
import { WorkspaceToast } from "@/components/workspace/workspace-toast";
import { ApiError } from "@/lib/api-client";
import { createMenuCategory, updateMenuCategory, updateMenuItemAvailability } from "@/services/restaurant-management-service";
import type { CreateMenuCategoryInput, ManagedMenuItem, MenuCategory } from "@/types/restaurant";

interface MenuManagerProps {
  restaurantId: number;
  menuCategories: MenuCategory[];
  menuItems: ManagedMenuItem[];
  token: string;
  onChanged: () => Promise<void>;
}

type DialogState =
  | { mode: "add-item" | "add-category" }
  | { mode: "view" | "edit" | "availability" | "images"; id: number }
  | { mode: "edit-category"; id: number };

export function MenuManager({ restaurantId, menuCategories, menuItems, token, onChanged }: MenuManagerProps) {
  const [tab, setTab] = useState<"items" | "categories">("items");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("all");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const working = useRef(false);
  const busy = isWorking || formBusy;
  const item = dialog && "id" in dialog && dialog.mode !== "edit-category" ? menuItems.find(item => item.id === dialog.id) : undefined;
  const category = dialog?.mode === "edit-category" ? menuCategories.find(category => category.id === dialog.id) : undefined;
  const filteredItems = menuItems.filter(item =>
    `${item.name} ${item.menuCategory.name}`.toLowerCase().includes(search.toLowerCase()) &&
    (availability === "all" || item.isAvailable === (availability === "available")));
  const filteredCategories = [...menuCategories]
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
    .filter(category => category.name.toLowerCase().includes(search.toLowerCase()));
  const total = tab === "items" ? filteredItems.length : filteredCategories.length;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(total / WORKSPACE_PAGE_SIZE)));
  const start = (currentPage - 1) * WORKSPACE_PAGE_SIZE;
  const pageItems = filteredItems.slice(start, start + WORKSPACE_PAGE_SIZE);
  const pageCategories = filteredCategories.slice(start, start + WORKSPACE_PAGE_SIZE);

  function open(next: DialogState) { setError(""); setFeedback(""); setDialog(next); }
  function close() { if (!busy && !working.current) { setDialog(null); setError(""); } }

  async function runAction(action: () => Promise<unknown>, success: string) {
    if (working.current || formBusy) return false;
    working.current = true;
    setIsWorking(true); setError(""); setFeedback("");
    try {
      await action();
      await onChanged();
      setFeedback(success);
      return true;
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Unable to complete the menu request.");
      return false;
    } finally {
      working.current = false;
      setIsWorking(false);
    }
  }

  async function saveCategory(input: CreateMenuCategoryInput) {
    const saved = await runAction(
      () => category ? updateMenuCategory(category.id, input, token) : createMenuCategory(restaurantId, input, token),
      category ? "Menu category updated successfully." : "Menu category added successfully.",
    );
    if (saved) setDialog(null);
  }

  const title = dialog?.mode === "add-item" ? "Add menu item" : dialog?.mode === "add-category" ? "Add menu category" :
    dialog?.mode === "edit-category" ? "Edit menu category" : dialog?.mode === "edit" ? `Edit ${item?.name}` :
    dialog?.mode === "images" ? `Photos of ${item?.name}` : dialog?.mode === "availability" ? "Update availability" : item?.name ?? "Menu item";

  return <section className="text-panel-text">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <WorkspaceTabs label="Menu management lists" options={[{ value: "items", label: `Menu items (${menuItems.length})` }, { value: "categories", label: `Menu categories (${menuCategories.length})` }]} value={tab} onChange={value => { setTab(value); setPage(1); setSearch(""); }} />
      <div className="flex gap-2">
        <button type="button" onClick={() => open({ mode: "add-category" })} className="workspace-button">Add category</button>
        <button type="button" disabled={!menuCategories.length} onClick={() => open({ mode: "add-item" })} className="workspace-button workspace-button-primary">Add menu item</button>
      </div>
    </div>
    {!menuCategories.length ? <p className="mt-3 text-sm text-panel-muted">Add a menu category to start adding dishes.</p> : null}
    <div className="mt-4 flex flex-wrap gap-3">
      <label className="min-w-0 flex-1 sm:max-w-sm"><span className="sr-only">Search {tab === "items" ? "menu items" : "menu categories"}</span><input type="search" placeholder={tab === "items" ? "Search item or category" : "Search category"} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="workspace-input text-sm" /></label>
      {tab === "items" ? <label><span className="sr-only">Filter availability</span><select value={availability} onChange={event => { setAvailability(event.target.value); setPage(1); }} className="workspace-input text-sm"><option value="all">All availability</option><option value="available">Available</option><option value="unavailable">Unavailable</option></select></label> : null}
    </div>
    {feedback && !dialog ? <WorkspaceToast message={feedback} onDismiss={() => setFeedback("")} /> : null}
    <div className="workspace-card mt-4 overflow-hidden">
      <div className="flex justify-between gap-3 border-b border-panel-border px-5 py-4"><h3 className="text-sm font-semibold">{tab === "items" ? "Menu items" : "Menu categories"}</h3><span className="text-xs text-panel-muted">{total} matching</span></div>
      {!total ? <p className="p-8 text-center text-sm text-panel-muted">{search ? "No matches. Try another search." : tab === "items" ? "No menu items match this filter." : "No menu categories added yet."}</p> : tab === "items" ?
        <WorkspaceTable onRowClick={id => open({ mode: "view", id })} label="Menu items" header={<tr><th>Item</th><th className="hidden md:table-cell">Category</th><th>Price</th><th>Availability</th><th>Actions</th></tr>}>
          {pageItems.map(item => {
            const image = item.images.find(image => image.isPrimary) ?? item.images[0];
            return <tr key={item.id} data-record-id={item.id}>
              <td className="h-18 max-w-xs px-5 py-3"><div className="flex items-center gap-3">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.imageUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                ) : <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft font-semibold text-brand-hover">{item.name.charAt(0)}</span>}
                <button type="button" onClick={() => open({ mode: "view", id: item.id })} className="min-w-0 text-left"><span className="block truncate font-semibold">{item.name}</span><span className="mt-1 block text-xs text-panel-muted">#{item.id}</span></button>
              </div></td>
              <td className="hidden px-4 py-3 text-panel-muted md:table-cell">{item.menuCategory.name}</td>
              <td className="whitespace-nowrap px-4 py-3">LKR {Number(item.price).toFixed(2)}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isAvailable ? "bg-success-soft text-success-text" : "bg-panel-subtle text-panel-muted"}`}>{item.isAvailable ? "Available" : "Unavailable"}</span></td>
              <td className="px-3 py-3"><div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => open({ mode: "view", id: item.id })} className="workspace-button">View</button>
                <button type="button" onClick={() => open({ mode: "edit", id: item.id })} className="workspace-button">Edit</button>
                <button type="button" onClick={() => open({ mode: "availability", id: item.id })} className="workspace-button">{item.isAvailable ? "Make unavailable" : "Make available"}</button>
                <button type="button" onClick={() => open({ mode: "images", id: item.id })} className="workspace-button">Photos ({item.images.length})</button>
              </div></td>
            </tr>;
          })}
        </WorkspaceTable> : <WorkspaceTable onRowClick={id => open({ mode: "edit-category", id })} label="Menu categories" header={<tr><th>Category</th><th>Display order</th><th>Items</th><th>Actions</th></tr>}>
          {pageCategories.map(category => <tr key={category.id} data-record-id={category.id}><td className="h-18 px-5 py-3 font-semibold">{category.name}</td><td className="px-4 py-3">{category.displayOrder}</td><td className="px-4 py-3">{menuItems.filter(item => item.menuCategoryId === category.id).length}</td><td className="px-3 py-3 text-right"><button type="button" onClick={() => open({ mode: "edit-category", id: category.id })} className="workspace-button">Edit category</button></td></tr>)}
        </WorkspaceTable>}
      <Pagination label="Menu pagination" page={currentPage} total={total} onPageChange={setPage} />
    </div>
    {dialog ? <WorkspaceDialog key={`${dialog.mode}-${"id" in dialog ? dialog.id : "new"}`} title={title} busy={busy} onClose={close} footer={
      dialog.mode === "add-item" || dialog.mode === "edit" ? <button type="submit" form="menu-item-editor" disabled={busy || !menuCategories.length} className="workspace-button workspace-button-primary">{busy ? "Saving..." : dialog.mode === "edit" ? "Save changes" : "Add menu item"}</button> :
      dialog.mode === "add-category" || dialog.mode === "edit-category" ? <button type="submit" form="menu-category-editor" disabled={busy} className="workspace-button workspace-button-primary">{busy ? "Saving..." : "Save category"}</button> :
      item && dialog.mode === "availability" ? <button type="button" disabled={busy} onClick={async () => {
        if (await runAction(() => updateMenuItemAvailability(item.id, !item.isAvailable, token), `${item.name} is now ${item.isAvailable ? "unavailable" : "available"}.`)) setDialog(null);
      }} className="workspace-button workspace-button-primary">{busy ? "Updating..." : item.isAvailable ? "Confirm unavailable" : "Confirm available"}</button> :
      item && dialog.mode === "view" ? <><button type="button" onClick={() => open({ mode: "edit", id: item.id })} className="workspace-button workspace-button-primary">Edit item</button><button type="button" onClick={() => open({ mode: "availability", id: item.id })} className="workspace-button">Update availability</button><button type="button" onClick={() => open({ mode: "images", id: item.id })} className="workspace-button">Manage photos</button></> : null
    }>
      {error ? <p role="alert" className="mb-4 rounded-2xl bg-danger-soft p-4 text-sm text-danger-text">{error}</p> : null}
      {feedback ? <p role="status" className="mb-4 rounded-2xl bg-success-soft p-4 text-sm text-success-text">{feedback}</p> : null}
      {dialog.mode === "add-item" || dialog.mode === "edit" ? <MenuItemForm restaurantId={restaurantId} categories={menuCategories} item={item} token={token} onChanged={onChanged} formId="menu-item-editor" externalSubmit onBusy={setFormBusy} onSaved={() => { setDialog(null); setFeedback(item ? "Menu item updated successfully." : "Menu item added successfully."); }} /> : null}
      {dialog.mode === "add-category" || dialog.mode === "edit-category" ? <MenuCategoryForm category={category} busy={busy} formId="menu-category-editor" onSave={saveCategory} /> : null}
      {item && (dialog.mode === "view" || dialog.mode === "availability") ? <div>
        {dialog.mode === "view" && item.images.length ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={(item.images.find(image => image.isPrimary) ?? item.images[0]).imageUrl} alt={(item.images.find(image => image.isPrimary) ?? item.images[0]).altText ?? item.name} className="mb-5 max-h-64 w-full rounded-2xl object-cover" />
        ) : null}
        <p className="text-sm text-panel-muted">{item.menuCategory.name} · #{item.id}</p><h3 className="mt-2 text-xl font-bold">{item.name}</h3>
        <p className="mt-3 whitespace-pre-line text-sm leading-6">{item.description || "No description added."}</p>
        <p className="mt-4 font-semibold">LKR {Number(item.price).toFixed(2)}</p><p className="mt-2 text-sm text-panel-muted">Currently {item.isAvailable ? "available" : "unavailable"}</p>
        {dialog.mode === "availability" ? <p className="mt-4 rounded-2xl bg-brand-soft p-4 text-sm">{item.isAvailable ? "Mark this dish as unavailable to customers?" : "Make this dish available to customers?"}</p> : null}
      </div> : null}
      {item && dialog.mode === "images" ? <MenuItemImages item={item} token={token} busy={busy} runAction={runAction} onChanged={onChanged} onBusy={setFormBusy} /> : null}
    </WorkspaceDialog> : null}
  </section>;
}
