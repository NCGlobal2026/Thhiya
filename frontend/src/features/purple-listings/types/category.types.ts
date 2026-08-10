export interface Category {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: string; // lucide-react icon name
}

export interface CategoryWithCount extends Category {
    companyCount: number;
}
