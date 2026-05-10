import { Link } from "@tanstack/react-router";

export function AdminQuickReference() {
  return (
    <div className="bg-card border border-primary/20 p-6 rounded-none mb-8">
      <h3 className="font-bold mb-4 text-lg">Quick Reference</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="font-semibold text-green-700 mb-1">Active</div>
          <div className="text-muted-foreground">Visible on marketplace</div>
        </div>
        <div>
          <div className="font-semibold text-yellow-700 mb-1">Pending</div>
          <div className="text-muted-foreground">Needs approval</div>
        </div>
        <div>
          <div className="font-semibold text-red-700 mb-1">Banned</div>
          <div className="text-muted-foreground">Hidden from marketplace</div>
        </div>
        <div>
          <Link to="/marketplace" className="font-semibold text-primary hover:underline">
            View Marketplace →
          </Link>
          <div className="text-muted-foreground text-xs">See freelancers publicly</div>
        </div>
      </div>
    </div>
  );
}
