import { Order } from "./types";
import { AppSettings } from "@/hooks/useSettings";

export const printOrder = (order: Order, settings: AppSettings) => {
    // Open a new window for the print job
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) {
        alert("Veuillez autoriser les pop-ups pour imprimer le ticket.");
        return;
    }

    // Format date and time
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // CSS for Thermal Printer
    // 80mm paper is roughly 72-80mm printable width.
    // We use generic font-family suitable for receipts.
    const styles = `
        <style>
            @page {
                size: 80mm auto;
                margin: 0;
            }
            body {
                font-family: 'Courier New', monospace;
                width: 72mm; /* Slightly narrower to strictly ensure centering */
                margin: 0 auto;
                padding: 10px 0;
                color: black;
                background: white;
                font-size: 18px; /* Huge readability */
                line-height: 1.3;
                text-align: center; /* Default center alignment for everything except table */
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 3px dashed black;
                padding-bottom: 15px;
            }
            .header h1 {
                font-size: 36px;
                margin: 0;
                text-transform: uppercase;
                font-weight: 900;
                line-height: 1.1;
            }
            .header p {
                margin: 5px 0 0 0;
                font-size: 16px;
            }
            .order-info {
                text-align: left; /* Keep info readable */
                margin-bottom: 20px;
                font-size: 18px;
            }
            .order-info strong {
                font-weight: 900;
                font-size: 22px;
                display: block;
                margin-bottom: 5px;
            }
            .type-badge {
                text-align: center;
                font-size: 28px;
                font-weight: 900;
                border: 4px solid black;
                padding: 10px;
                margin: 20px 0;
                text-transform: uppercase;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 18px; 
                text-align: left; /* Table stays structured */
            }
            th {
                text-align: left;
                border-bottom: 3px solid black;
                padding-bottom: 8px;
                font-size: 18px;
                font-weight: 900;
            }
            td {
                padding: 10px 0;
                vertical-align: top;
            }
            .qty {
                width: 15%;
                font-weight: 900;
                font-size: 20px;
            }
            .item {
                width: 55%;
                font-weight: bold;
            }
            .price {
                width: 30%;
                text-align: right;
                font-weight: 900;
                font-size: 20px;
            }
            .total-section {
                border-top: 4px dashed black;
                padding-top: 15px;
                margin-top: 15px;
                text-align: right;
            }
            .total-line {
                font-size: 32px;
                font-weight: 900;
                margin-top: 5px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                font-size: 16px;
                border-top: 2px solid black;
                padding-top: 15px;
                font-weight: bold;
            }
            .cut-line {
                border-bottom: 2px dashed black;
                margin-top: 40px;
                text-align: center;
                font-size: 14px;
                padding-bottom: 5px;
            }
        </style>
    `;

    // HTML Content
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ticket #${order.id}</title>
            ${styles}
        </head>
        <body>
            
            <div class="header">
                <h1>${settings.restaurantName || "Snack Manager"}</h1>
                <p>${dateStr} - ${timeStr}</p>
            </div>

            <div class="type-badge">
                ${order.type === 'sur_place' ? 'SUR PLACE' : order.type === 'livraison' ? 'LIVRAISON' : 'A EMPORTER'}
            </div>

            <div class="order-info">
                <strong>Commande #${order.id}</strong>
                Client: ${order.customerName}<br/>
                ${order.phoneNumber ? `Tél: ${order.phoneNumber}<br/>` : ''}
                ${order.type === 'livraison' && (order as any).address ? `Adr: ${(order as any).address}<br/>` : ''}
            </div>

            ${order.notes ? `
            <div style="margin-bottom: 15px; padding: 5px; border: 1px solid black;">
                <strong>Note:</strong> ${order.notes}
            </div>
            ` : ''}

            <table>
                <thead>
                    <tr>
                        <th class="qty">Qte</th>
                        <th class="item">Article</th>
                        <th class="price">EUR</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td class="qty">${item.quantity}x</td>
                            <td class="item">${item.name}</td>
                            <td class="price">${(item.price * item.quantity).toFixed(2).replace('.', ',')} €</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total-section">
                <div class="total-line">
                    TOTAL: ${order.totalPrice.toFixed(2).replace('.', ',')} €
                </div>
                <div style="font-size: 12px; margin-top: 5px;">
                    Statut: ${order.status.toUpperCase()}
                </div>
            </div>

            <div class="footer">
                <p>Merci de votre visite !</p>
                <p>À bientôt</p>
            </div>

            <div class="cut-line">
                --- découper ici ---
            </div>

            <script>
                window.onload = function() {
                    window.print();
                    // Optional: window.close() after print if desired (improves flow but might close too fast on some browsers)
                    // setTimeout(() => window.close(), 1000); 
                }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close(); // Important for layout to finish rendering
};
