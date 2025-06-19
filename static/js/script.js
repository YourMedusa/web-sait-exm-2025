<!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- EasyMDE JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/easymde/2.18.0/easymde.min.js"></script>

// Инициализация EasyMDE редакторов
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация EasyMDE для описания книги
    const descriptionTextarea = document.getElementById('short_description');
    if (descriptionTextarea) {
        new EasyMDE({
            element: descriptionTextarea,
            spellChecker: false,
            placeholder: 'Введите краткое описание книги...',
            toolbar: [
                'bold', 'italic', 'heading', '|',
                'quote', 'unordered-list', 'ordered-list', '|',
                'link', 'image', '|',
                'preview', 'side-by-side', 'fullscreen', '|',
                'guide'
            ],
            autosave: {
                enabled: true,
                uniqueId: 'book_description',
                delay: 1000,
            }
        });
    }

    // Инициализация EasyMDE для текста рецензии
    const reviewTextarea = document.getElementById('review_text');
    if (reviewTextarea) {
        new EasyMDE({
            element: reviewTextarea,
            spellChecker: false,
            placeholder: 'Напишите вашу рецензию...',
            toolbar: [
                'bold', 'italic', 'heading', '|',
                'quote', 'unordered-list', 'ordered-list', '|',
                'link', '|',
                'preview', 'side-by-side', 'fullscreen', '|',
                'guide'
            ],
            autosave: {
                enabled: true,
                uniqueId: 'review_text',
                delay: 1000,
            }
        });
    }

    // Добавляем анимацию появления карточек
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = (index * 0.1) + 's';
        card.classList.add('fade-in');
    });
});

// Функция подтверждения удаления
function confirmDelete(bookId, bookTitle) {
    document.getElementById('deleteMessage').textContent =
        'Вы уверены, что хотите удалить книгу "' + bookTitle + '"?';
    document.getElementById('deleteForm').action = '/book/' + bookId + '/delete';
    var deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

// Функция показа уведомлений
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';

    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Функция для предварительного просмотра загружаемого изображения
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('imagePreviewContainer');

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            preview.src = e.target.result;
            previewContainer.style.display = 'block';
        };

        reader.readAsDataURL(input.files[0]);
    } else {
        previewContainer.style.display = 'none';
    }
}

// Функция валидации формы
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Функция для экспорта данных в CSV
function exportToCSV(url, filename) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Ошибка при экспорте:', error);
            alert('Произошла ошибка при экспорте данных');
        });
}

// Функция автоматического изменения размера текстовых областей
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Функция настройки автодополнения поиска
function setupSearchAutocomplete() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let timeoutId;

    searchInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        const query = this.value.trim();

        if (query.length < 2) {
            hideAutocomplete();
            return;
        }

        timeoutId = setTimeout(() => {
            fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    showAutocomplete(data.suggestions, this);
                })
                .catch(error => {
                    console.error('Ошибка поиска:', error);
                });
        }, 300);
    });

    // Скрытие автодополнения при клике вне поля
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target)) {
            hideAutocomplete();
        }
    });
}

// Функция показа автодополнения
function showAutocomplete(suggestions, input) {
    hideAutocomplete();

    if (suggestions.length === 0) return;

    const autocompleteDiv = document.createElement('div');
    autocompleteDiv.id = 'searchAutocomplete';
    autocompleteDiv.className = 'autocomplete-suggestions';
    autocompleteDiv.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #1a202c;
        border: 1px solid #2d3748;
        border-top: none;
        border-radius: 0 0 8px 8px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.style.cssText = `
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 1px solid #2d3748;
            color: #e8eaed;
            transition: background-color 0.2s;
        `;
        item.textContent = suggestion.title;

        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#2d3748';
        });

        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });

        item.addEventListener('click', function() {
            input.value = suggestion.title;
            hideAutocomplete();
            // Можно добавить автоматический поиск при выборе
        });

        autocompleteDiv.appendChild(item);
    });

    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(autocompleteDiv);
}

// Функция скрытия автодополнения
function hideAutocomplete() {
    const autocomplete = document.getElementById('searchAutocomplete');
    if (autocomplete) {
        autocomplete.remove();
    }
}

// Функция настройки звездочного рейтинга
function setupStarRating() {
    const ratingContainers = document.querySelectorAll('.star-rating');
    
    ratingContainers.forEach(container => {
        const stars = container.querySelectorAll('.star');
        const ratingInput = container.querySelector('input[type="hidden"]');
        
        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => highlightStars(index + 1, container));
            star.addEventListener('mouseleave', () => highlightStars(parseInt(ratingInput.value) || 0, container));
            star.addEventListener('click', () => setRating(index + 1, container, ratingInput));
        });
    });
}

// Функция подсветки звездочек
function highlightStars(rating, container) {
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Функция установки рейтинга
function setRating(rating, container, input) {
    input.value = rating;
    highlightStars(rating, container);
}

// Функция загрузки контента через AJAX
function loadContent(url, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

    fetch(url)
        .then(response => response.text())
        .then(html => {
            container.innerHTML = html;
            initializeBootstrapComponents(container);
        })
        .catch(error => {
            console.error('Ошибка загрузки:', error);
            container.innerHTML = '<div class="alert alert-danger">Ошибка загрузки контента</div>';
        });
}

// Функция инициализации компонентов Bootstrap в динамически загруженном контенте
function initializeBootstrapComponents(container) {
    // Инициализация тултипов
    const tooltips = container.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));

    // Инициализация попапов
    const popovers = container.querySelectorAll('[data-bs-toggle="popover"]');
    popovers.forEach(popover => new bootstrap.Popover(popover));

    // Инициализация модальных окон
    const modals = container.querySelectorAll('.modal');
    modals.forEach(modal => new bootstrap.Modal(modal));
}

// Функция отправки формы через AJAX
function submitFormAjax(formId, successCallback) {
    const form = document.getElementById(formId);
    if (!form) return;

    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Показываем индикатор загрузки
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Отправка...';

    fetch(form.action, {
        method: form.method,
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (successCallback) {
                successCallback(data);
            } else {
                showNotification(data.message || 'Операция выполнена успешно', 'success');
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            }
        } else {
            showNotification(data.message || 'Произошла ошибка', 'danger');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showNotification('Произошла ошибка при выполнении операции', 'danger');
    })
    .finally(() => {
        // Восстанавливаем кнопку
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

// Функция переключения фильтров поиска
function toggleSearchFilters() {
    const filtersContainer = document.getElementById('searchFilters');
    if (filtersContainer) {
        const isVisible = filtersContainer.style.display !== 'none';
        filtersContainer.style.display = isVisible ? 'none' : 'block';
        
        const toggleBtn = document.getElementById('toggleFiltersBtn');
        if (toggleBtn) {
            toggleBtn.innerHTML = isVisible ? 
                '<i class="fas fa-filter"></i> Показать фильтры' : 
                '<i class="fas fa-times"></i> Скрыть фильтры';
        }
    }
}

// Функция сброса фильтров поиска
function resetSearchFilters() {
    const form = document.getElementById('searchForm');
    if (form) {
        form.reset();
        // Можно добавить автоматическую отправку формы после сброса
        // form.submit();
    }
}

// Обработка ошибок загрузки изображений
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[src*="uploads"]');
    
    images.forEach(function(img) {
        img.addEventListener('error', function() {
            // Заменяем изображение на плейсхолдер при ошибке загрузки
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'card-img-top bg-secondary d-flex align-items-center justify-content-center';
            placeholder.innerHTML = '<i class="fas fa-image fa-3x text-muted"></i>';
            this.parentNode.insertBefore(placeholder, this);
        });
        
        // Добавляем эффект загрузки
        img.addEventListener('load', function() {
            this.style.opacity = '0';
            this.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 100);
        });
    });
});

// Ленивая загрузка изображений
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('lazy-image');
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Инициализация ленивой загрузки
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Улучшенная обработка форм
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            }
        });
    });
});

// Анимации для карточек
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });
    
    cards.forEach(card => cardObserver.observe(card));
});

// Улучшенная обработка модальных окон
document.addEventListener('DOMContentLoaded', function() {
    const modalTriggers = document.querySelectorAll('[data-bs-toggle="modal"]');
    
    modalTriggers.forEach(function(trigger) {
        trigger.addEventListener('click', function() {
            const targetModal = document.querySelector(this.getAttribute('data-bs-target'));
            if (targetModal) {
                // Анимация появления модального окна
                targetModal.style.opacity = '0';
                targetModal.style.transform = 'scale(0.8)';
                targetModal.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    targetModal.style.opacity = '1';
                    targetModal.style.transform = 'scale(1)';
                }, 100);
            }
        });
    });
});

// Обработка загрузки файлов
document.addEventListener('DOMContentLoaded', function() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(function(input) {
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                // Проверка размера файла
                const maxSize = 16 * 1024 * 1024; // 16MB
                if (file.size > maxSize) {
                    alert('Файл слишком большой. Максимальный размер: 16MB');
                    this.value = '';
                    return;
                }
                
                // Проверка типа файла
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Неподдерживаемый тип файла. Разрешены только: JPG, PNG, GIF');
                    this.value = '';
                    return;
                }
                
                // Предварительный просмотр
                const previewContainer = document.getElementById('imagePreviewContainer');
                const preview = document.getElementById('imagePreview');
                
                if (previewContainer && preview) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.src = e.target.result;
                        previewContainer.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    });
});

// Улучшенная обработка кнопок
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            // Эффект пульсации при клике
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
});

// Обработка подтверждения удаления
document.addEventListener('DOMContentLoaded', function() {
    const deleteForms = document.querySelectorAll('form[onsubmit*="confirm"]');
    
    deleteForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            const message = this.getAttribute('data-confirm-message') || 
                           'Вы уверены, что хотите выполнить это действие?';
            
            if (!confirm(message)) {
                e.preventDefault();
                return false;
            }
        });
    });
});

// Улучшенная обработка навигации
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            // Убираем активный класс у всех ссылок
            navLinks.forEach(l => l.classList.remove('active'));
            // Добавляем активный класс к текущей ссылке
            this.classList.add('active');
        });
    });
});

// Обработка поиска
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('input[type="search"]');
    
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                // Здесь можно добавить логику поиска
                console.log('Поиск:', this.value);
            }, 300);
        });
    }
});

// Улучшенная обработка пагинации
document.addEventListener('DOMContentLoaded', function() {
    const paginationLinks = document.querySelectorAll('.page-link');
    
    paginationLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            if (this.parentElement.classList.contains('disabled')) {
                e.preventDefault();
                return false;
            }
            
            // Показываем индикатор загрузки
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
            document.body.appendChild(loadingIndicator);
        });
    });
});

// Обработка уведомлений
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(function(alert) {
        // Автоматическое скрытие уведомлений через 5 секунд
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-20px)';
            alert.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
        
        // Кнопка закрытия
        const closeButton = alert.querySelector('.btn-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-20px)';
                alert.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    alert.remove();
                }, 300);
            });
        }
    });
});

// Улучшенная обработка таблиц
document.addEventListener('DOMContentLoaded', function() {
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(function(table) {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(function(row, index) {
            // Добавляем эффект при наведении
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#2d3748';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
            
            // Анимация появления строк
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 100);
        });
    });
});

// Обработка темной темы
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('light-theme');
            
            // Сохраняем предпочтение в localStorage
            const isLightTheme = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
        });
        
        // Восстанавливаем сохраненную тему
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }
    }
});