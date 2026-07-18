-- Insert default email template for the first event
DO $$
DECLARE
  first_event_id UUID;
BEGIN
  SELECT id INTO first_event_id FROM events LIMIT 1;
  
  IF first_event_id IS NOT NULL THEN
    INSERT INTO email_templates (event_id, name, type, subject, body_html)
    VALUES (
      first_event_id,
      'Default E-Ticket Delivery',
      'ticket_delivery',
      'E-Tiket Anda untuk Acara {{event.name}}',
      '<html><body>
        <h2>Halo {{participant.name}},</h2>
        <p>Pendaftaran Anda untuk acara <strong>{{event.name}}</strong> telah berhasil dikonfirmasi.</p>
        <p>Berikut adalah Guest ID Anda: <strong>{{ticket.guest_id}}</strong></p>
        <p>Silakan gunakan QR Code di bawah ini untuk check-in pada saat acara berlangsung:</p>
        <div style="padding: 20px; border: 1px solid #ccc; display: inline-block;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ticket.qr_token}}" alt="QR Code" />
        </div>
        <p>Terima kasih,</p>
        <p>Panitia {{event.name}}</p>
      </body></html>'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
