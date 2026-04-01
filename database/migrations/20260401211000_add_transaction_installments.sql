alter table public.transactions
add column if not exists installment_group_id uuid,
add column if not exists installment_index integer,
add column if not exists installment_count integer;

alter table public.transactions
drop constraint if exists transactions_installments_consistency_chk;

alter table public.transactions
add constraint transactions_installments_consistency_chk
check (
  (
    installment_group_id is null and
    installment_index is null and
    installment_count is null
  ) or (
    installment_group_id is not null and
    installment_index is not null and
    installment_count is not null and
    installment_index >= 1 and
    installment_count >= 1 and
    installment_index <= installment_count
  )
);

create index if not exists transactions_installment_group_id_idx
on public.transactions (installment_group_id);
