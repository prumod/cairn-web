# Interactive prototype coverage

This is the traceability map for the two prototype implementations described in [the prototype contract](prototype.md#duas-implementações). Each capability is in one implementation only: the [main prototype](../../../apps/web/references/prototype-discovery/) covers the capabilities being decided now; the [interactive wireframe](../../../apps/web/references/interactive-wireframe.tsx) covers the future ones. When a capability gets a main prototype, its part is removed from the wireframe. The [Now prototype specification](../now/especificacao-prototipo.md) describes the main prototype's behavior in detail; the main prototype is the source of truth for Now. The priority names below are documentation references only. The application does not display those labels. Capability identifiers follow the [identifier mapping](../README.md#correspondência-de-identificadores) after transcription 3.

## Discovery — main prototype

| Capability | Screen or interaction                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N01        | The header shows the fictional company, its place, search radius, class and priority work types. Editing the profile is not implemented.                                                                                                                                                                                                                                                                                        |
| N02        | Distance and publication-date filters reduce fictional notices to works inside the company radius. Empty results show a message in the table. In the Localidade popover, the map shows localities without obras in the current filters as a distinct state.                                                                                                                                                                     |
| N03        | The table of all obras inside the company radius is the main view. The Localidade filter opens a popover with the map (company and radius, localities with counts, selection by drag) or, as chosen in Opções, a list of checkboxes with Selecionar todos. Selecting a contest opens N04.                                                                                                                                       |
| N04        | The contest panel shows buyer, location, announced value, execution period, submission deadline, required licence, platform, publication date and a fictional source-notice preview.                                                                                                                                                                                                                                            |
| N13        | The assistant sits beside the table, with suggested prompts. Commented localities and works and cited text are its context. It applies filters, including the locality filter, and shows its results in the table and, as chosen in Opções, in the chat as a list, a small map, or both. The same Opções panel chooses whether actions apply at once or as a proposal.                                                          |
| N14        | Filters for distance, publication date, value, buyer, work type and locality apply to the table. One «Limpar filtros» clears all of them, including the agent results. Priority work types are marked «★ prioridade» and never excluded. The table groups obras by locality; the count, «Selecionar todos» and the assistant order priority types first. A deadline filter is not implemented; the assistant sorts by deadline. |

## Later capabilities

L09–L16 belong to proposal preparation, not work execution. L10–L16 were moved from Now after transcription 3; their existing demonstrations remain. This documentation change does not verify or change the current frontend.

| Capability | Screen or interaction                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L01        | Supplier screen searches fictional suppliers, records and compares quotations, marks a human-selected preferred supplier, and previews a simulated quotation extraction. |
| L02        | Proposal follow-up shows competitor values, report and complaint previews, post-award qualification documents, draft contract and handover record.                       |
| L03        | Works screen shows fictional works and clients and edits a local work record.                                                                                            |
| L04        | People and equipment screen records work assignments and equipment allocation without automatic resource scheduling.                                                     |
| L05        | Materials screen shows fictional per-work stock and records a local material need without placing an order.                                                              |
| L06        | Finance screen edits expenses, billed amounts and received amounts separately and answers a demonstration question from those values.                                    |
| L07        | Planning screen edits task completion and shows task dependencies, dates and a schematic Gantt.                                                                          |
| L08        | Reception and warranty screen distinguishes execution, provisional reception, warranty, inspections, repairs, retention and final reception.                             |
| L09        | Proposal screen marks the financial schedule as required or not required and records its prepared state. This capability is deferred from Now to Later.                  |
| L10        | Deadline screen sorts fixed example dates and labels upcoming and expired delivery dates.                                                                                |
| L11        | Invitation screen records a local intention to participate or not. No mailbox or external procedure is opened.                                                           |
| L12        | Opportunity detail compares the fictional requirements with the company profile and records a local participation decision. The review does not certify eligibility.     |
| L13        | Proposal screen opens bundled fictional document previews.                                                                                                               |
| L14        | Proposal checklist marks required documents as prepared or missing.                                                                                                      |
| L15        | Proposal price table edits unit prices and calculates subtotals and total. Missing prices block review.                                                                  |
| L16        | Proposal review lists omissions, checks the fixed deadline, returns to preparation and simulates submission without sending documents.                                   |
| L17        | Not implemented. The assistant does not navigate the application.                                                                                                        |
| L18        | Not implemented. No phase-grouped view exists.                                                                                                                           |

## Capabilities to evaluate

| Capability | Screen or interaction                                                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M01        | Planning screen shows task bars, dates, dependencies, resource assignments and a fixed illustrative completion estimate.                                             |
| M03        | Competitor screen compares fictional participations, values, outcomes and schematic locations. It warns that the examples do not establish fraud or source coverage. |
| M04        | Finance screen answers questions from the visible example amounts and distinguishes billed from received values.                                                     |
| M05        | Supplier screen returns fictional suppliers for a material search.                                                                                                   |
| M06        | Supplier screen previews fictional e-mail/quotation extraction and provides a failure state. It does not read email.                                                 |
| M07        | Price history screen shows fixed fictional price observations and quotation validity dates.                                                                          |
| M08        | Reference-price screen calculates a mean from entered fictional quotations and lets the user inspect a margin assumption without applying it automatically.          |
| M09        | Material forecast estimates days of stock from entered consumption and stock assumptions.                                                                            |
| M10        | Value summary shows a waterfall diagram and the same amounts in a table.                                                                                             |
| M11        | Advanced map screen edits quantities and financial-schedule percentages and previews simulated import and export outcomes.                                           |
| M12        | Contract-pattern screen shows a small fictional sample, its criteria and its limits. Repeated wins do not imply fraud.                                               |
| M13        | Not implemented.                                                                                                                                                     |
| M14        | Not implemented.                                                                                                                                                     |
| M15        | Not implemented.                                                                                                                                                     |

## Excluded capabilities

X01–X03 have no screens by design.

## Prototype limits

- Examples and dates are fictional and fixed. The current reference date of the main prototype is 15 October 2026, 09:00, a day without notices.
- React state stays in memory. Refreshing or using the reset control restores the examples.
- The app has no backend, database, authentication, real file input, outbound request, mailbox access or external integration.
- A simulated submission always states that no document was sent.
- SVG diagrams encode geometry and interaction only. The app has no presentation stylesheet or visual library.
- Demonstration calculations do not establish legal, procurement or accounting rules.

## Review status

Before transcription 3, all 32 documented capabilities mapped to an implemented screen or interaction. Of the 38 capabilities documented now, N14 is partly covered and L17, L18 and M13–M15 are not covered. A browser smoke pass visited all 21 task screens at a 390-pixel viewport; none caused horizontal page overflow. The smoke pass also exercised empty-search recovery, proposal preparation, simulated submission and reset. Axe reported no violations on the opportunity map, proposal screen, Gantt screen and initial page. Axe could not determine contrast for some text inside the SVG diagrams.

`bun run check`, changed-file formatting and `git diff --check` passed. The browser smoke test does not prove that every workflow or the user experience is complete.
