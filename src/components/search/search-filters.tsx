"use client";

import { useState } from "react";
import { Search, Calendar, MapPin, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export interface SearchFilters {
  searchQuery: string;
  category: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  status: string;
}

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void;
  showStatus?: boolean;
  userType?: "student" | "security";
}

const categories = [
  "Electronics",
  "Clothing",
  "Accessories",
  "Books",
  "Keys",
  "ID/Cards",
  "Bags",
  "Jewelry",
  "Sports Equipment",
  "Other",
];

const commonLocations = [
  "Library",
  "Cafeteria",
  "Gym",
  "Classroom Building A",
  "Classroom Building B",
  "Student Center",
  "Parking Lot",
  "Dormitory",
  "Auditorium",
  "Sports Field",
];

export function SearchFilters({
  onFilterChange,
  showStatus = false,
  userType = "student",
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: "",
    category: "",
    location: "",
    dateFrom: "",
    dateTo: "",
    status: "",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {
      searchQuery: "",
      category: "",
      location: "",
      dateFrom: "",
      dateTo: "",
      status: "",
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        {/* Search Bar - Always Visible */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by item name or description..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </Label>
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilter("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Select
                value={filters.location}
                onValueChange={(value) => updateFilter("location", value)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All locations</SelectItem>
                  {commonLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showStatus && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {userType === "student" ? (
                      <>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="claimed">Claimed</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                From Date
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                To Date
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.category && (
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                {filters.category}
              </span>
            )}
            {filters.location && (
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                {filters.location}
              </span>
            )}
            {filters.status && (
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                Status: {filters.status}
              </span>
            )}
            {filters.dateFrom && (
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                From: {new Date(filters.dateFrom).toLocaleDateString()}
              </span>
            )}
            {filters.dateTo && (
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                To: {new Date(filters.dateTo).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
