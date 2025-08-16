import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Define supported languages
export const supportedLanguages = {
    en: "English",
    ru: "Русский",
    uk: "Українська",
};

export const defaultLanguage = "en";
export const fallbackLanguage = "en";

// Language detection options
const detectionOptions = {
    // Order of language detection methods
    order: ["localStorage", "navigator", "htmlTag", "path", "subdomain"],

    // Cache the detected language
    caches: ["localStorage"],

    // Don't cache in cookies for GDPR compliance
    excludeCacheFor: ["cimode"],

    // Check all fallback languages
    checkWhitelist: true,
};

// Initialize i18next
const initI18n = () => {
    if (!i18n.isInitialized) {
        i18n.use(LanguageDetector)
            .use(initReactI18next)
            .init({
                // Supported languages
                supportedLngs: Object.keys(supportedLanguages),

                // Fallback language
                fallbackLng: fallbackLanguage,

                // Default language
                lng: defaultLanguage,

                // Language detection
                detection: detectionOptions,

                // Debug mode (set to false in production)
                debug: process.env.NODE_ENV === "development",

                // Load resources
                resources: {
                    en: {
                        translation: {
                            // Common
                            loading: "Loading...",
                            error: "Error",
                            success: "Success",
                            cancel: "Cancel",
                            save: "Save",
                            delete: "Delete",
                            edit: "Edit",
                            add: "Add",
                            search: "Search",
                            filter: "Filter",
                            sort: "Sort",

                            // Navigation
                            home: "Home",
                            indices: "Indices",
                            portfolio: "Portfolio",
                            about: "About",
                            contact: "Contact",
                            blog: "Blog",

                            // Common UI
                            common: {
                                language: "Language",
                                openMenu: "Open menu",
                                closeMenu: "Close menu",
                                user: "User",
                                rank: "Rank",
                                asset: "Asset",
                                allocation: "Allocation",
                                price: "Price",
                                total: "Total",
                                maxDrawdown: "Max Drawdown",
                                marketCap: "Market Cap",
                                duration: "Duration",
                                assetsBreakdown: "Assets Breakdown",
                                noDataAvailable: "No data available",
                                loadingCryptoIndices: "Loading crypto indices...",
                                cryptoIndices: "Crypto Indices",
                                days7: "7 days",
                                days30: "30 days",
                                chart30d: "30d Chart",
                                viewOnExplorer: "View on Explorer",
                                cloneIndex: "Clone index",
                                editIndex: "Edit index",
                                deleteIndex: "Delete index",
                                selectAssetToAdd: "Select asset to add",
                                indexNameRequired: "Index name is required",
                                indexNameMinLength: "Index name must be at least 2 characters",
                                indexNameMaxLength: "Index name must be less than 100 characters",
                                portionMinError: "Portion must be at least 0%",
                                portionMaxError: "Portion cannot exceed 100%",
                                portionRequired: "Portion is required",
                                atLeastOneAsset: "At least one asset is required",
                                totalAllocationError: "Total allocation must equal 100%",
                                indexName: "Index Name",
                                assetsAllocation: "Assets & Allocation",
                                enterIndexName: "Enter index name",
                                enterNewIndexName: "Enter new index name",
                                chart: "Chart",
                            },

                            // Authentication
                            auth: {
                                signIn: "Sign In",
                                signOut: "Sign Out",
                                user: "User",
                            },

                            // Index Modal
                            indexModal: {
                                createCustomIndex: "Create Custom Index",
                                editIndex: "Edit Index",
                                cloneIndex: "Clone Index",
                                createIndex: "Create Index",
                                updateIndex: "Update Index",
                                cloneIndexAction: "Clone Index",
                                cloneIndexDescription:
                                    "Create a custom copy of this index with your own asset allocation and portfolio composition.",
                            },

                            // Home page
                            homepage: {
                                loadingMessage: "Loading Indexopia...",
                                viewAllIndices: "View All Indices",
                                hero: {
                                    title: "The Ultimate Crypto Index Platform",
                                    subtitle:
                                        "Track your crypto like a pro with real-time data, professional portfolio management, and access to thousands of curated crypto indices.",
                                    exploreIndices: "Explore Indices",
                                    signUpFree: "Sign Up Free",
                                    realTimeData: "Real-time Data",
                                    realTimeDataDesc: "Get instant access to live crypto prices and market data",
                                    professionalTools: "Professional Tools",
                                    professionalToolsDesc: "Advanced portfolio tracking and P&L analysis",
                                    thousandsPortfolios: "Thousands of Portfolios",
                                    thousandsPortfoliosDesc: "Access curated indices from crypto experts",
                                },
                                benefits: {
                                    title: "Why Choose Indexopia?",
                                    subtitle: "Everything you need to build and manage a successful crypto portfolio",
                                    professionalAnalytics: "Professional Analytics",
                                    professionalAnalyticsDesc:
                                        "Advanced charts, metrics, and performance analysis tools used by professional traders.",
                                    riskManagement: "Risk Management",
                                    riskManagementDesc:
                                        "Built-in risk assessment tools and portfolio optimization to protect your investments.",
                                    globalMarkets: "Global Markets",
                                    globalMarketsDesc:
                                        "Access to worldwide crypto markets with real-time data from major exchanges.",
                                    communityDriven: "Community Driven",
                                    communityDrivenDesc:
                                        "Learn from experienced traders and share strategies with our growing community.",
                                    fastExecution: "Fast Execution",
                                    fastExecutionDesc:
                                        "Lightning-fast data processing and real-time portfolio updates.",
                                    provenStrategies: "Proven Strategies",
                                    provenStrategiesDesc:
                                        "Access to time-tested investment strategies with documented performance.",
                                },
                                cta: {
                                    title: "Ready to Start Your Crypto Journey?",
                                    subtitle:
                                        "Join thousands of investors who trust Indexopia for their crypto portfolio management. Start with our free tier and upgrade as you grow.",
                                    getStartedFree: "Get Started Free",
                                    exploreIndices: "Explore Indices",
                                },
                            },

                            // Footer
                            footer: {
                                about: "About",
                                explore: "Explore",
                                community: "Join Our Community",
                                description:
                                    "Indexopia is a platform for creating and tracking crypto indices and crypto portfolios.",
                                termsOfService: "Terms of Service",
                                privacyPolicy: "Privacy Policy",
                                contact: "Contact",
                                freeIndices: "Free Crypto Indices",
                                copyright: "© 2025 Indexopia. All Rights Reserved.",
                            },

                            // Crypto
                            crypto: {
                                index: "Index",
                                indices: "Indices",
                                portfolio: "Portfolio",
                                price: "Price",
                                change: "Change",
                                volume: "Volume",
                                marketCap: "Market Cap",
                            },
                        },
                    },
                    ru: {
                        translation: {
                            // Common
                            loading: "Загрузка...",
                            error: "Ошибка",
                            success: "Успешно",
                            cancel: "Отмена",
                            save: "Сохранить",
                            delete: "Удалить",
                            edit: "Редактировать",
                            add: "Добавить",
                            search: "Поиск",
                            filter: "Фильтр",
                            sort: "Сортировка",

                            // Navigation
                            home: "Главная",
                            indices: "Индексы",
                            portfolio: "Портфель",
                            about: "О нас",
                            contact: "Контакты",
                            blog: "Блог",

                            // Common UI
                            common: {
                                language: "Язык",
                                openMenu: "Открыть меню",
                                closeMenu: "Закрыть меню",
                                user: "Пользователь",
                                rank: "Ранг",
                                asset: "Актив",
                                allocation: "Распределение",
                                price: "Цена",
                                total: "Всего",
                                maxDrawdown: "Макс. просадка",
                                marketCap: "Рын. капитализация",
                                duration: "Длительность",
                                assetsBreakdown: "Структура активов",
                                noDataAvailable: "Нет данных",
                                loadingCryptoIndices: "Загрузка крипто индексов...",
                                cryptoIndices: "Крипто индексы",
                                days7: "7 дней",
                                days30: "30 дней",
                                chart30d: "График 30д",
                                viewOnExplorer: "Посмотреть в обозревателе",
                                cloneIndex: "Клонировать индекс",
                                editIndex: "Редактировать индекс",
                                deleteIndex: "Удалить индекс",
                                selectAssetToAdd: "Выберите актив для добавления",
                                indexNameRequired: "Название индекса обязательно",
                                indexNameMinLength: "Название индекса должно содержать минимум 2 символа",
                                indexNameMaxLength: "Название индекса должно содержать менее 100 символов",
                                portionMinError: "Доля должна быть не менее 0%",
                                portionMaxError: "Доля не может превышать 100%",
                                portionRequired: "Доля обязательна",
                                atLeastOneAsset: "Необходим как минимум один актив",
                                totalAllocationError: "Общее распределение должно равняться 100%",
                                indexName: "Название индекса",
                                assetsAllocation: "Активы и распределение",
                                enterIndexName: "Введите название индекса",
                                enterNewIndexName: "Введите новое название индекса",
                                chart: "График",
                            },

                            // Authentication
                            auth: {
                                signIn: "Войти",
                                signOut: "Выйти",
                                user: "Пользователь",
                            },

                            // Index Modal
                            indexModal: {
                                createCustomIndex: "Создать пользовательский индекс",
                                editIndex: "Редактировать индекс",
                                cloneIndex: "Клонировать индекс",
                                createIndex: "Создать индекс",
                                updateIndex: "Обновить индекс",
                                cloneIndexAction: "Клонировать индекс",
                                cloneIndexDescription:
                                    "Создайте персональную копию этого индекса с собственным распределением активов и составом портфеля.",
                            },

                            // Home page
                            homepage: {
                                loadingMessage: "Загрузка Indexopia...",
                                viewAllIndices: "Посмотреть все индексы",
                                hero: {
                                    title: "Лучшая платформа криптоиндексов",
                                    subtitle:
                                        "Отслеживайте криптовалюты как профессионал с данными в реальном времени, профессиональным управлением портфелем и доступом к тысячам курируемых криптоиндексов.",
                                    exploreIndices: "Исследовать индексы",
                                    signUpFree: "Зарегистрироваться бесплатно",
                                    realTimeData: "Данные в реальном времени",
                                    realTimeDataDesc:
                                        "Получайте мгновенный доступ к ценам криптовалют и рыночным данным в реальном времени",
                                    professionalTools: "Профессиональные инструменты",
                                    professionalToolsDesc: "Расширенное отслеживание портфеля и анализ P&L",
                                    thousandsPortfolios: "Тысячи портфелей",
                                    thousandsPortfoliosDesc:
                                        "Доступ к курируемым индексам от экспертов по криптовалютам",
                                },
                                benefits: {
                                    title: "Почему стоит выбрать Indexopia?",
                                    subtitle: "Все, что нужно для создания и управления успешным криптопортфелем",
                                    professionalAnalytics: "Профессиональная аналитика",
                                    professionalAnalyticsDesc:
                                        "Продвинутые графики, метрики и инструменты анализа производительности, используемые профессиональными трейдерами.",
                                    riskManagement: "Управление рисками",
                                    riskManagementDesc:
                                        "Встроенные инструменты оценки рисков и оптимизации портфеля для защиты ваших инвестиций.",
                                    globalMarkets: "Глобальные рынки",
                                    globalMarketsDesc:
                                        "Доступ к мировым рынкам криптовалют с данными в реальном времени с основных бирж.",
                                    communityDriven: "Сообщество",
                                    communityDrivenDesc:
                                        "Учитесь у опытных трейдеров и делитесь стратегиями с нашим растущим сообществом.",
                                    fastExecution: "Быстрое выполнение",
                                    fastExecutionDesc:
                                        "Молниеносная обработка данных и обновления портфеля в реальном времени.",
                                    provenStrategies: "Проверенные стратегии",
                                    provenStrategiesDesc:
                                        "Доступ к проверенным временем инвестиционным стратегиям с документированной производительностью.",
                                },
                                cta: {
                                    title: "Готовы начать свое криптопутешествие?",
                                    subtitle:
                                        "Присоединяйтесь к тысячам инвесторов, которые доверяют Indexopia управление своим криптопортфелем. Начните с нашего бесплатного тарифа и развивайтесь по мере роста.",
                                    getStartedFree: "Начать бесплатно",
                                    exploreIndices: "Исследовать индексы",
                                },
                            },

                            // Footer
                            footer: {
                                about: "О нас",
                                explore: "Исследовать",
                                community: "Присоединяйтесь к сообществу",
                                description:
                                    "Indexopia - это платформа для создания и отслеживания криптоиндексов и криптопортфелей.",
                                termsOfService: "Условия использования",
                                privacyPolicy: "Политика конфиденциальности",
                                contact: "Контакты",
                                freeIndices: "Бесплатные криптоиндексы",
                                copyright: "© 2025 Indexopia. Все права защищены.",
                            },

                            // Crypto
                            crypto: {
                                index: "Индекс",
                                indices: "Индексы",
                                portfolio: "Портфель",
                                price: "Цена",
                                change: "Изменение",
                                volume: "Объем",
                                marketCap: "Рыночная капитализация",
                            },
                        },
                    },
                    uk: {
                        translation: {
                            // Common
                            loading: "Завантаження...",
                            error: "Помилка",
                            success: "Успішно",
                            cancel: "Скасувати",
                            save: "Зберегти",
                            delete: "Видалити",
                            edit: "Редагувати",
                            add: "Додати",
                            search: "Пошук",
                            filter: "Фільтр",
                            sort: "Сортування",

                            // Navigation
                            home: "Головна",
                            indices: "Індекси",
                            portfolio: "Портфель",
                            about: "Про нас",
                            contact: "Контакти",
                            blog: "Блог",

                            // Common UI
                            common: {
                                language: "Мова",
                                openMenu: "Відкрити меню",
                                closeMenu: "Закрити меню",
                                user: "Користувач",
                                rank: "Ранг",
                                asset: "Актив",
                                allocation: "Розподіл",
                                price: "Ціна",
                                total: "Загалом",
                                maxDrawdown: "Макс. просідання",
                                marketCap: "Ринк. капіталізація",
                                duration: "Тривалість",
                                assetsBreakdown: "Структура активів",
                                noDataAvailable: "Немає даних",
                                loadingCryptoIndices: "Завантаження крипто індексів...",
                                cryptoIndices: "Крипто індекси",
                                days7: "7 днів",
                                days30: "30 днів",
                                chart30d: "Графік 30д",
                                viewOnExplorer: "Переглянути в провіднику",
                                cloneIndex: "Клонувати індекс",
                                editIndex: "Редагувати індекс",
                                deleteIndex: "Видалити індекс",
                                selectAssetToAdd: "Оберіть актив для додавання",
                                indexNameRequired: "Назва індексу обов'язкова",
                                indexNameMinLength: "Назва індексу повинна містити мінімум 2 символи",
                                indexNameMaxLength: "Назва індексу повинна містити менше 100 символів",
                                portionMinError: "Частка повинна бути не менше 0%",
                                portionMaxError: "Частка не може перевищувати 100%",
                                portionRequired: "Частка обов'язкова",
                                atLeastOneAsset: "Необхідний як мінімум один актив",
                                totalAllocationError: "Загальний розподіл повинен дорівнювати 100%",
                                indexName: "Назва індексу",
                                assetsAllocation: "Активи та розподіл",
                                enterIndexName: "Введіть назву індексу",
                                enterNewIndexName: "Введіть нову назву індексу",
                                chart: "Графік",
                            },

                            // Authentication
                            auth: {
                                signIn: "Увійти",
                                signOut: "Вийти",
                                user: "Користувач",
                            },

                            // Index Modal
                            indexModal: {
                                createCustomIndex: "Створити користувацький індекс",
                                editIndex: "Редагувати індекс",
                                cloneIndex: "Клонувати індекс",
                                createIndex: "Створити індекс",
                                updateIndex: "Оновити індекс",
                                cloneIndexAction: "Клонувати індекс",
                                cloneIndexDescription:
                                    "Створіть персональну копію цього індексу з власним розподілом активів та складом портфеля.",
                            },

                            // Home page
                            homepage: {
                                loadingMessage: "Завантаження Indexopia...",
                                viewAllIndices: "Переглянути всі індекси",
                                hero: {
                                    title: "Найкраща платформа криптоіндексів",
                                    subtitle:
                                        "Відстежуйте криптовалюти як професіонал з даними в реальному часі, професійним управлінням портфелем і доступом до тисяч курованих криптоіндексів.",
                                    exploreIndices: "Досліджувати індекси",
                                    signUpFree: "Зареєструватися безкоштовно",
                                    realTimeData: "Дані в реальному часі",
                                    realTimeDataDesc:
                                        "Отримуйте миттєвий доступ до цін криптовалют і ринкових даних у реальному часі",
                                    professionalTools: "Професійні інструменти",
                                    professionalToolsDesc: "Розширене відстеження портфеля та аналіз P&L",
                                    thousandsPortfolios: "Тисячі портфелів",
                                    thousandsPortfoliosDesc: "Доступ до курованих індексів від експертів з криптовалют",
                                },
                                benefits: {
                                    title: "Чому варто обрати Indexopia?",
                                    subtitle: "Все, що потрібно для створення та управління успішним криптопортфелем",
                                    professionalAnalytics: "Професійна аналітика",
                                    professionalAnalyticsDesc:
                                        "Просунуті графіки, метрики та інструменти аналізу продуктивності, що використовуються професійними трейдерами.",
                                    riskManagement: "Управління ризиками",
                                    riskManagementDesc:
                                        "Вбудовані інструменти оцінки ризиків та оптимізації портфеля для захисту ваших інвестицій.",
                                    globalMarkets: "Глобальні ринки",
                                    globalMarketsDesc:
                                        "Доступ до світових ринків криптовалют з даними в реальному часі з основних бірж.",
                                    communityDriven: "Спільнота",
                                    communityDrivenDesc:
                                        "Вчіться у досвідчених трейдерів і діліться стратегіями з нашою зростаючою спільнотою.",
                                    fastExecution: "Швидке виконання",
                                    fastExecutionDesc:
                                        "Блискавична обробка даних і оновлення портфеля в реальному часі.",
                                    provenStrategies: "Перевірені стратегії",
                                    provenStrategiesDesc:
                                        "Доступ до перевірених часом інвестиційних стратегій з документованою продуктивністю.",
                                },
                                cta: {
                                    title: "Готові розпочати свою криптоподорож?",
                                    subtitle:
                                        "Приєднуйтесь до тисяч інвесторів, які довіряють Indexopia управління своїм криптопортфелем. Почніть з нашого безкоштовного тарифу і розвивайтесь по мірі зростання.",
                                    getStartedFree: "Почати безкоштовно",
                                    exploreIndices: "Досліджувати індекси",
                                },
                            },

                            // Footer
                            footer: {
                                about: "Про нас",
                                explore: "Досліджувати",
                                community: "Приєднуйтесь до спільноти",
                                description:
                                    "Indexopia - це платформа для створення та відстеження криптоіндексів і криптопортфелів.",
                                termsOfService: "Умови використання",
                                privacyPolicy: "Політика конфіденційності",
                                contact: "Контакти",
                                freeIndices: "Безкоштовні криптоіндекси",
                                copyright: "© 2025 Indexopia. Усі права захищені.",
                            },

                            // Crypto
                            crypto: {
                                index: "Індекс",
                                indices: "Індекси",
                                portfolio: "Портфель",
                                price: "Ціна",
                                change: "Зміна",
                                volume: "Об'єм",
                                marketCap: "Ринкова капіталізація",
                            },
                        },
                    },
                },

                // Interpolation options
                interpolation: {
                    escapeValue: false, // React already escapes values
                },

                // React options
                react: {
                    useSuspense: false, // We'll handle loading states manually
                },
            });
    }

    return i18n;
};

export default initI18n;
