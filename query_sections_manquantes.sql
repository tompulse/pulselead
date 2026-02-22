select substring(code_naf, 1, 2) as section, count(*) as total
from nouveaux_sites
where substring(code_naf, 1, 2) in ('17','18','21','23','28','29','30','31','32','33','36','37','38','39','50','51','53','58','60','61','66','72','74','75','77','79','82','88','92','94','12')
group by section
order by total desc;
