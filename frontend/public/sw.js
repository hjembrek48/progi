self.addEventListener('push', function(event) {
    if (event.data) {
        let data;
        try {
            data = event.data.json();
        } catch (e) {
            data = {
                title: "Play Trade",
                body: event.data.text(),
                url: "/"
            };
        }

        const options = {
            body: data.body,
            icon: '/Logo.png',
            badge: '/Logo.png',
            data: {
                url: data.url || '/'
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title || "New Notification", options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
