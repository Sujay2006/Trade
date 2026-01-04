export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
  image: string;
  instructor: string;
  lessons: number;
  featured: boolean;
}
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete Forex Trading Masterclass',
    description: 'Learn professional forex trading strategies from scratch to advanced level',
    price: 199,
    originalPrice: 299,
    duration: '12 weeks',
    level: 'Beginner',
    rating: 4.8,
    students: 2847,
    image: 'forex trading',
    instructor: 'John Anderson',
    lessons: 45,
    featured: true
  },
]