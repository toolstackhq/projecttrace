# Performance Bug Roadmap

Do not implement these bottlenecks in the baseline.

| Bottleneck | Code change that would introduce it | Expected symptom | Detect with k6 | Detect with JMeter | Fix | Metric that should improve |
| --- | --- | --- | --- | --- | --- | --- |
| Missing database indexes | Remove foreign key and filter indexes from list/search tables | Slower filtered reads and summary queries | p95 and p99 rise on list/filter scenarios | Longer response times for filtered samplers | Restore indexes on common filters and foreign keys | p95, p99, throughput |
| N+1 queries | Load relations lazily in list and detail routes | Many repeated queries and slower pages | Dashboard/detail latency climbs under load | Samplers show unstable response times | Use eager loading or fewer round trips | p95, DB query count |
| No pagination | Return full table data from list endpoints | Larger payloads and slower list pages | List endpoints slow as dataset grows | Read-heavy thread groups degrade quickly | Restore pagination and caps | p90, payload size |
| Slow search | Use unindexed `ilike` across many columns | Search endpoints become CPU and DB heavy | Search test p95 increases sharply | Search sampler times spike | Add indexes or full-text search | p95, throughput |
| Large response payloads | Include nested graphs and verbose fields everywhere | Higher network and JSON parse time | Dashboard/list throughput drops | Response size increases in listeners | Trim response models and add dedicated detail calls | Throughput, response size |
| Synchronous activity logging | Write logs inline with every request and commit separately | Write latency rises on create/update | CRUD workflow gets slower | Write samplers show longer elapsed times | Buffer or batch log writes | Write latency, throughput |
| DB lock contention | Update the same rows repeatedly in hot paths | Writes stall under concurrency | CRUD test stalls and error rate rises | Thread group shows blocked samplers | Reduce hot-row updates and lock scope | Error rate, p95 |
| Bad connection pooling | Use tiny pool sizes or no pre-ping | Requests queue up or fail under load | Spike/stress tests show errors | Thread count grows with failures | Tune pool size, pre-ping, timeouts | Error rate, throughput |
| Inefficient joins | Join too many tables for list endpoints | Higher CPU and slower page loads | Dashboard and list latency increases | Aggregates and view samplers slow | Split queries or precompute summaries | p95, CPU |
| Expensive summary endpoint | Add many heavy aggregations to `/api/stats/summary` | Dashboard load becomes a bottleneck | Dashboard smoke/load worsens | Summary sampler dominates report | Cache or precompute summary data | Dashboard p95, DB time |

