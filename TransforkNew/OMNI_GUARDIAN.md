# TransforkNew Omni Guardian

Name:
TransforkNewMAR

Type:
Runtime Registry

Visibility:
Project

Creator:
Brenda

Location:
TransforkNew/SYSTEM/MAR.js

Purpose:
Owns TransforkNew runtime authority switches so listeners and runtime components do not fight.

Parameters:
entry objects with key, creator, purpose, timestamp, parent, on

Returns:
Registry API: register, isOn, set, enable, disable, get, list

Used By:
1

Status:
Active

Notes:
Use this MAR for new TransforkNew runtime owners. Do not create another MAR.

Name:
registerR

Type:
Keyboard Shortcut Registration

Visibility:
Project

Creator:
Brenda

Location:
TransforkNew/INPUT/SHORTCUTS/registerR.js

Purpose:
Registers the R key for the first TransforkNew UI test. Pressing R toggles the bounding box and buttons on the selected sprite.

Parameters:
shortcuts object

Returns:
None

Used By:
1

Status:
Active

Notes:
UI-only test. Does not perform transform operations.
