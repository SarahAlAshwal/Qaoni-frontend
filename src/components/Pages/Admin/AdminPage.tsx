import SlidesManager from "./SlidesManager";
import FeaturedShopsManager from "./FeaturedShopsManager";

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      <SlidesManager />
      <FeaturedShopsManager />
    </div>
  );
}
