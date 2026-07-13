# QuietChat Later Bugs


## Pinning Reorders Message To Bottom

User report:
- When user pinned a message, the pinned item together with the user message jumped to the bottom order.
- This should not happen. Pinning should only update pin metadata/row state.
- The original message order and current visible window position should remain stable.

Likely cause:
- Pin save updates message updated_at.
- Backend qc_rows sorts message files by file mtime.
- Writing the pinned message changes mtime, so that message appears latest/bottom on next view/search/load.
- Earlier pin no-refresh reduced this, but any later refresh can expose it.

Future fix direction:
- Do not sort conversation messages by file mtime for display order.
- Store and sort by created_at or message_id sequence instead.
- Pinning may update updated_at/pin_at, but must not affect timeline order.
- Search can still rank pins first without changing base message order.
