import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export const DebugDeliveries = () => {
  const [rawData, setRawData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const debug = async () => {
      try {
        console.log('🔍 TESTE 1: Consultando vw_deliveries...');
        const { data: viewData, error: viewError } = await supabase
          .from('vw_deliveries')
          .select('*')
          .limit(3);

        if (viewError) {
          console.error('❌ Erro na view:', viewError);
          setError(`Erro na view: ${viewError.message}`);
          return;
        }

        console.log('✅ vw_deliveries retornou:', viewData);

        console.log('\n🔍 TESTE 2: Consultando tabela deliveries pura...');
        const { data: tableData, error: tableError } = await supabase
          .from('deliveries')
          .select('id, order_number, nf_number, customer_id, expedition_id')
          .limit(3);

        if (tableError) {
          console.error('❌ Erro na tabela:', tableError);
          return;
        }

        console.log('✅ deliveries retornou:', tableData);

        console.log('\n🔍 TESTE 3: Verificando expeditions...');
        const { data: expedData, error: expedError } = await supabase
          .from('expeditions')
          .select('id, client_name')
          .limit(3);

        if (expedError) {
          console.error('❌ Erro em expeditions:', expedError);
          return;
        }

        console.log('✅ expeditions retornou:', expedData);

        setRawData(viewData || []);
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError(String(err));
      }
    };

    debug();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#f5f5f5' }}>
      <h1>🔧 DEBUG: Dados de Entregas</h1>
      <p>Abra o CONSOLE (F12) para ver os testes de debug</p>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      <h2>Dados da View (vw_deliveries):</h2>
      <pre style={{ background: '#fff', padding: '10px', overflowX: 'auto', border: '1px solid #ddd' }}>
        {JSON.stringify(rawData, null, 2)}
      </pre>

      <h3>Se você vir acima:</h3>
      <ul>
        <li>
          <strong>customer_name null:</strong> A view NÃO foi atualizada no Supabase. Execute o SQL em ARRUME_AGORA.sh
        </li>
        <li>
          <strong>customer_name com valor:</strong> A view está ok! Problema está no código frontend.
        </li>
        <li>
          <strong>expedition_id null:</strong> As entregas não estão linkadas a expedições. Verifique a criação.
        </li>
      </ul>
    </div>
  );
};
