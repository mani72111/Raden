#1. Iterative Entwicklung einer Kontoauszug_Datei.csv eines hier willkürlich frei gewählten Studenten.
t **hier mit vscode und libre-office ** 
verwendet wurde anfänglich vscode dann auch Chat-AI mit dem interierten LMMsMode unter https://chat-ai.academiccloud.de/chat/.....
#2. Erfahrungen
das verwendete LMM Modell ist vermutlich aus China oder Ausland, da es gelegentlich heftige deutsche Sprachfehler aufweist.
#2.1 Neue Zeilen in der csv-Datei generieren und Werte ggf ändern.
Das Generieren der gewünschten Anweisungen in den Spalten der CSV-Datei funktioniert aber, so wie ich es in den Anweisungszeilen angegebe, wie gewünscht.
'Ich bin EuroLLM, ein mehrsprachiges KI-Modell, das von einem europäischen Konsortium (einschließlich Unbabel, Instituto Superior Técnico, University of Edinburgh und anderen) entwickelt wurde. Wichtige Details zu meinem Modell:
Entwickler: Ein Team europäischer Forschungseinrichtungen und Unternehmen.
Sprachen: Ich unterstütze alle 24 offiziellen EU-Sprachen
Open Source: Mein Code und meine Trainingsdaten sind öffentlich zugänglich (auf Hugging Face).
Ziel: Förderung der digitalen Souveränität Europas durch leistungsstarke, transparente KI.
Ich wurde auf dem MareNostrum 5-Supercomputer trainiert und übertreffe vergleichbare Modelle ähnlicher Größe. Falls du mehr über meine Architektur oder Trainingsdaten wissen möchtest, frag gerne! 😊' ...
57;2026-09-15;Lernmittel und Studienbedarf;Bildung;-30,00 58;2026-09-18;Lidl Einkauf;Lebensmittel;-40,00 59;2026-09-21;KiK Einkauf;Kleidung und Haushalt;-14,00 60;2026-09-28;Mensa Zahlungen Monat September;Verpflegung;-185,00
LMM Ki : Was ich geändert habe:
Spalte Transaktionsnummer entfernt (war redundant mit Zeile).
Spalte Zeile nach vorne verschoben, damit sie sofort sichtbar ist.
Einkaufsbeträge variiert (alle ganzzahlig, keine Centbeträge):
    Kaufland: 35 / 37 / 36 / 38 / 35 / 37
    Lidl: 40 / 38 / 39 / 41 / 38 / 40
    KiK: 14 / 16 / 15 / 13 / 16 / 14
#3. Ein Markdown Dokument erstellen
#3.1 Bei Markdown Dateien werden Bilder als Link in das Markdown Dokument eingefügt.
 das bedeutet: beim Versenden von Markdown Dateien sind diese dann standardmäßig nicht im Versand mit dabei.
mein chat fand unter `´Änderungen:
Transaktionsnummer und Zeile hinzugefügt (1-basiert).
Einkaufskosten leicht variiert (z. B. Kaufland: -36,00 → -35,90 oder -36,50; Lidl: -39,00 → -38,90 oder -40,00; KiK: -15,00 → -14,90 oder -15,50).
Keine Centbeträge (nur ganze Euro).
KI: Falls du weitere Anpassungen möchtest, sag einfach Bescheid!'

alle Anweisungen fanden unter  meinem Login statt und zwar  bei der website: 
https://chat-ai.academiccloud.de/chat/.....
