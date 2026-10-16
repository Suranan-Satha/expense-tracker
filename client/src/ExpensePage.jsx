// แทนที่ส่วนตารางรายการรายจ่ายใน ExpensePage.jsx
<section className="card">
  <div className="card-title">
    <h2>รายการรายจ่าย</h2>
  </div>
  <div className="table-container" style={{ paddingTop: '16px' }}>
    {loading ? (
        <div className="loading-box">
          <p className="muted">กำลังโหลดข้อมูลรายการ...</p>
          <div className="xp-progress-bar" style={{ maxWidth: '250px' }}>
            <div className="xp-progress-fill"></div>
          </div>
        </div>
    ) : data.items.length === 0 ? (
        <p className="muted">ไม่พบรายการ</p>
    ) : (
        <table>
          <thead>
          <tr>
            <th>วันที่</th>
            <th>หมวดหมู่</th>
            <th>หมายเหตุ</th>
            <th className="num">จำนวน (฿)</th>
            <th style={{ textAlign: 'right' }}>จัดการ</th>
          </tr>
          </thead>
          <tbody>
          {data.items.map((it) => (
              <tr key={it.id}>
                <td>{it.date}</td>
                <td><span className="badge">{CATEGORIES[it.category]}</span></td>
                <td>{it.note || <span className="muted">-</span>}</td>
                <td className="num">{baht(it.amount)}</td>
                <td className="actions">
                  <div className="action-btns">
                    <button className="btn btn-sm" onClick={() => { setEditing(it); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      แก้ไข
                    </button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(it)}>
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
    )}
  </div>
</section>