(async ()=>{
  try {
    const { pool } = require('./server/config/database');
    const sql = `SELECT c.*, p.tipo_pago, o.total as total_orden FROM comprobante c INNER JOIN pago p ON c.id_pago = p.id_pago INNER JOIN orden o ON c.id_orden = o.id_orden ORDER BY c.fecha_emision DESC`;
    const [rows] = await pool.execute(sql);
    console.log('ROWS LENGTH:', rows.length);
    console.log(rows.slice(0,5));
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    process.exit();
  }
})();
