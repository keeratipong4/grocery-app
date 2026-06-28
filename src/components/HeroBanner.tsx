export default function HeroBanner() {
  return (
    <section className="bg-surface py-6">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[70fr_30fr] gap-6 min-h-[340px]">

          {/* Main Banner */}
          <div className="relative bg-gradient-to-br from-green-100 via-green-200 to-green-300 rounded-banner flex items-center px-10 py-12 overflow-hidden min-h-[220px]">
            <div className="absolute right-10 bottom-0 text-[160px] opacity-20 leading-none select-none" aria-hidden="true">
              🥦
            </div>
            <div className="relative z-10">
              <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                สด &amp; ออร์แกนิค
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
                ผักสดใหม่<br />
                <span className="text-success">ลดพิเศษ</span>
              </h1>
              <p className="text-gray-600 mb-6">
                ประหยัดสูงสุด <strong>50%</strong> สำหรับออเดอร์แรกของคุณ
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors"
              >
                ช้อปเลย →
              </a>
            </div>
          </div>

          {/* Promo Banners */}
          <div className="flex flex-row lg:flex-col gap-4">
            <div className="relative flex-1 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-banner flex items-center px-6 py-6 overflow-hidden">
              <div className="absolute right-2 bottom-0 text-6xl opacity-25 leading-none select-none" aria-hidden="true">🍎</div>
              <div className="relative z-10">
                <span className="inline-block bg-success text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2">Organic</span>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  ผลไม้สด<br />
                  <small className="text-xs font-normal text-gray-500">คอลเลกชันพิเศษ</small>
                </h3>
                <p className="text-xs text-gray-500 mt-1">เริ่มต้น <strong className="text-gray-900">฿39</strong></p>
                <a href="#" className="text-xs font-semibold text-primary mt-2 block hover:underline">ช้อปเลย →</a>
              </div>
            </div>
            <div className="relative flex-1 bg-gradient-to-br from-blue-100 to-sky-200 rounded-banner flex items-center px-6 py-6 overflow-hidden">
              <div className="absolute right-2 bottom-0 text-6xl opacity-25 leading-none select-none" aria-hidden="true">🥛</div>
              <div className="relative z-10">
                <span className="inline-block bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2">Hot Deal</span>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  นม &amp; ไข่<br />
                  <small className="text-xs font-normal text-gray-500">สดจากฟาร์ม</small>
                </h3>
                <p className="text-xs text-gray-500 mt-1">เริ่มต้น <strong className="text-gray-900">฿49</strong></p>
                <a href="#" className="text-xs font-semibold text-primary mt-2 block hover:underline">ช้อปเลย →</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
