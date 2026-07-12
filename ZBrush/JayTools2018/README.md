# Jay Tools for ZBrush 2018

Converted from the uploaded `JayMainTools.txt` as a ZBrush 2018-compatible ZPlugin source.

## Requested groups

- **DynaMan:** Target Points, PGroups, DynaM
- **MaskMan:** FrontMask Only, GrowMask, Mask Sharpness, MaskPenHardSize, MaskPenhardOnly, Mask Pen Restore
- **ResoluteMan:** AdaptRes, Lowest Lvl Polys, Highest Lvl Polys, Highest Lvl SubD Lvl, Alt Remeshing, RemeshQ, ZmeshQ
- **IsoBoy:** FixProjg, IsolateProjQ, ProjQ, DelProjQ, CleanMeshQ, FullReconstructMesh
- **EditButler:** FaceMode, EdgeMode, PointMode
- **Extractor:** SampleHeight, FlatEdges, PanelGrpAppend, PanelGrpBevel, PanelFrpAdv

All other top-level controls were removed from the plugin UI.

## Required files not included in the upload

The main script references these dependencies, and the plugin cannot compile or run without them:

`JMemVarRoutines.txt`, `JStringRoutines.txt`, `JMathRoutines.txt`, `JEssentialRoutines.txt`, `JColorRoutines.txt`, `JMouseRoutines.txt`, `JKeyboardRoutines.txt`, `JMessageRoutines.txt`, `JDisplayRoutines.txt`, `JSubToolRoutines.txt`, `JUndoRoutines.txt`, `JBrushRoutines.txt`, `JSceneRoutines.txt`, `JErrorRoutines.txt`, and `JSleepRoutines.txt`.

## ZBrush 2018 installation

1. Put the converted source and all dependency files in `ZBrush 2018/ZStartup/ZPlugs64/JayTools2018/`.
2. Load the source using **ZScript > Load**.
3. Compile it using **ZScript > Compile** to generate the `.zsc` file.
4. Restart ZBrush 2018.

The final `.zsc` must be compiled inside ZBrush 2018.