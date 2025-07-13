export {};
//
//
//
//
//
//
//
// // Usage examples in different pages:
//
// // app/page.tsx - Home page with suspense
// import SuspenseWrapper from '@/components/ui/suspense-wrapper';
// import { lazy } from 'react';
//
// const HomePage = lazy(() => import('@/components/pages/home-page'));
//
// export default function Home() {
//     return (
//         <SuspenseWrapper
//             loadingMessage="Loading Indexopia..."
//             variant="spinner"
//             showLogo={true}
//         >
//             <HomePage />
//         </SuspenseWrapper>
//     );
// }
//
// // app/indices/page.tsx - Indices page with table loading
// import SuspenseWrapper from '@/components/ui/suspense-wrapper';
// import ContentLoader from '@/components/ui/content-loader';
// import { lazy } from 'react';
//
// const IndicesPage = lazy(() => import('@/components/pages/indices-page'));
//
// export default function Indices() {
//     return (
//         <SuspenseWrapper
//             loadingMessage="Loading crypto indices..."
//             variant="dots"
//             showLogo={false}
//             fullScreen={false}
//             fallback={
//                 <div className="container mx-auto px-4 py-8">
//                     <ContentLoader type="table" count={5} />
//                 </div>
//             }
//         >
//             <IndicesPage />
//         </SuspenseWrapper>
//     );
// }
//
// // app/indices/[id]/page.tsx - Individual index page
// import SuspenseWrapper from '@/components/ui/suspense-wrapper';
// import ContentLoader from '@/components/ui/content-loader';
// import { lazy } from 'react';
//
// const IndexDetailPage = lazy(() => import('@/components/pages/index-detail-page'));
//
// export default function IndexDetail() {
//     return (
//         <SuspenseWrapper
//             loadingMessage="Loading index details..."
//             variant="pulse"
//             showLogo={false}
//             fullScreen={false}
//             fallback={
//                 <div className="container mx-auto px-4 py-8 space-y-8">
//                     <ContentLoader type="card" count={1} />
//                     <ContentLoader type="chart" count={1} />
//                     <ContentLoader type="table" count={3} />
//                 </div>
//             }
//         >
//             <IndexDetailPage />
//         </SuspenseWrapper>
//     );
// }
//
// // app/loading.tsx - Global loading UI
// import PageLoader from '@/components/ui/page-loader';
//
// export default function Loading() {
//     return (
//         <PageLoader
//             variant="spinner"
//             message="Loading..."
//             showLogo={true}
//             fullScreen={true}
//         />
//     );
// }
//
// // Custom hook for loading states
// // hooks/use-loading.ts
// import { useState, useCallback } from 'react';
//
// interface UseLoadingReturn {
//     isLoading: boolean;
//     startLoading: () => void;
//     stopLoading: () => void;
//     withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
// }
//
// export function useLoading(initialState = false): UseLoadingReturn {
//     const [isLoading, setIsLoading] = useState(initialState);
//
//     const startLoading = useCallback(() => setIsLoading(true), []);
//     const stopLoading = useCallback(() => setIsLoading(false), []);
//
//     const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
//         startLoading();
//         try {
//             const result = await fn();
//             return result;
//         } finally {
//             stopLoading();
//         }
//     }, [startLoading, stopLoading]);
//
//     return {
//         isLoading,
//         startLoading,
//         stopLoading,
//         withLoading,
//     };
// }
