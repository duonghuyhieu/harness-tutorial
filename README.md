# harness-tutorial

Trang web hướng dẫn (tiếng Việt) về **harness engineering cho AI coding agent** và cách dùng
[harness-kit](https://github.com/duonghuyhieu/harness-kit):

| Trang | Nội dung |
|---|---|
| `index.html` — Tổng quan | Luận điểm "mô hình mạnh ≠ thực thi đáng tin cậy", số liệu then chốt, Agent = Model + Harness, phổ prompt → graph |
| `problems.html` — Vấn đề | 9 vấn đề của AI agent 2025–2026 (áp lực hoàn thành, khai sai "đã xong", reward hacking, vượt phạm vi, mất ngữ cảnh, tệp hướng dẫn khổng lồ, prompt injection, giám sát yếu đi, sự cố 2026) |
| `principles.html` — Nguyên lý | 13 nguyên lý harness engineering: cơ chế, artifact, chống mẫu |
| `harness-kit.html` | harness-kit xử lý từng vấn đề ra sao: kiến trúc ba lớp, bảng ánh xạ, máy trạng thái tương tác, dòng thời gian hook, đánh giá và giới hạn |
| `guide.html` — Hướng dẫn | Cài một lệnh, quy trình hằng ngày, 16 lệnh `/hk-*`, vòng lặp tự trị, xử lý sự cố |
| `references.html` | Nguồn của mọi con số |

Mỗi con số trên trang mang nhãn bằng chứng — **Đo** (số liệu công bố), **SX** (báo cáo sản xuất), **MH** (minh họa),
**SL** (suy luận) — và một trích dẫn tới `references.html`. Số liệu tra cứu ngày 15/10/2026.

## Xem trang

Mở `index.html` bằng trình duyệt, hoặc chạy một server tĩnh:

```bash
python -m http.server 8000      # rồi mở http://localhost:8000
```

Không cần build, không có framework; trang vẫn đọc được khi tắt JavaScript, và tắt hiệu ứng khi hệ điều hành bật
"giảm chuyển động".

## Trang này được xây dựng bằng chính harness-kit

- harness-kit được cài vào repo (`.claude/`, `AGENTS.md`, `feature_list.json`, `scripts/harness.py`…).
- Nguồn sự thật duy nhất cho nội dung: `docs/CONTENT.md`; khung trang và thành phần: `docs/PAGE-TEMPLATE.html`.
- Mỗi trang là một feature có lệnh verification `python tests/check_site.py --page <trang>`. Bộ kiểm tra kiểm cấu
  trúc, link, trích dẫn, nhãn bằng chứng, và **chặn mọi con số phần trăm không có trong `docs/CONTENT.md`**.
- Các trang được dựng bằng vòng lặp `python scripts/harness.py loop`: maker (phiên mới, chỉ được ghi trang của mình)
  → reviewer chỉ đọc (đối chiếu từng con số với `docs/CONTENT.md` theo rubric) → pass-gate → commit.
- Quá trình này phát hiện hai lỗi thật của harness-kit và một lỗi của bộ kiểm tra; cả ba được ghi vào
  `.harness/failures.jsonl` theo lớp harness và đã sửa (xem trang harness-kit, mục Đánh giá).

Kiểm tra toàn trang: `python tests/check_site.py --strict`. Trạng thái: `python scripts/harness.py status`.
