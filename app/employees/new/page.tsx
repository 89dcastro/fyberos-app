import { supabase } from '../../../lib/supabase'
import NewEmployeeForm from './page-client'

export default async function NewEmployeePage() {
  const { data: crews } = await supabase
    .from('crews')
    .select('id, name')
    .order('name')

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('name')

  return <NewEmployeeForm crews={crews || []} branches={branches || []} />
}