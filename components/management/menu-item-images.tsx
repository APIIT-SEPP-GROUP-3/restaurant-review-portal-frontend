"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/management/image-uploader";
import { deleteMenuItemImage } from "@/services/restaurant-management-service";
import type { ManagedMenuItem } from "@/types/restaurant";

export function MenuItemImages({ item, token, busy, runAction, onChanged, onBusy }: {
  item: ManagedMenuItem; token: string; busy: boolean;
  runAction: (action: () => Promise<unknown>, success: string) => Promise<boolean>;
  onChanged: () => Promise<void>; onBusy: (busy: boolean) => void;
}) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  return <div>
    <p className="text-sm text-panel-muted">Manage photos of {item.name}. Upload a photo or choose one to remove.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {item.images.map(image => <article key={image.id} className="workspace-card overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.imageUrl} alt={image.altText ?? item.name} className="h-40 w-full object-cover" />
        <div className="flex items-center justify-between gap-3 p-3"><span className="text-xs text-panel-muted">{image.isPrimary ? "Primary photo" : "Photo"} · #{image.id}</span>
          <button type="button" disabled={busy} onClick={() => setDeleteId(image.id)} className="workspace-button text-danger">Remove</button>
        </div>
      </article>)}
    </div>
    {!item.images.length ? <p className="mt-4 text-sm text-panel-muted">No photos added yet.</p> : null}
    {deleteId !== null ? <div className="mt-4 rounded-2xl bg-danger-soft p-4">
      <p className="text-sm font-semibold text-danger-text">Remove photo #{deleteId} from this menu item?</p>
      <div className="mt-3 flex gap-2"><button type="button" disabled={busy} onClick={async () => {
        if (await runAction(() => deleteMenuItemImage(item.id, deleteId, token), "Menu item photo removed successfully.")) setDeleteId(null);
      }} className="workspace-button bg-danger text-white">Confirm removal</button>
        <button type="button" disabled={busy} onClick={() => setDeleteId(null)} className="workspace-button">Cancel removal</button>
      </div>
    </div> : null}
    <ImageUploader resource="menu-items" resourceId={item.id} token={token} disabled={busy} onChanged={onChanged} onBusy={onBusy} />
  </div>;
}
