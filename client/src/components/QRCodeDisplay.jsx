import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay = ({ value, size = 200, title }) => {
  return (
    <div className="qr-display">
      {title && (
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {title}
        </p>
      )}
      <div className="payment-qr">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
    </div>
  );
};

export default QRCodeDisplay;
