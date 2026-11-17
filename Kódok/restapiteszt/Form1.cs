using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Windows.Forms;

namespace restapiteszt
{
    public partial class Form1 : Form
    {
        private static readonly HttpClient _httpClient = new HttpClient();

        private class ApiEndpoint
        {
            public string Category { get; set; }
            public string Method { get; set; }
            public string Path { get; set; }
            public string SampleJson { get; set; }

            public ApiEndpoint(string category, string method, string path, string sampleJson = "")
            {
                Category = category;
                Method = method;
                Path = path;
                SampleJson = sampleJson;
            }

            public override string ToString()
            {
                return string.Format("[{0}]  {1,-4}  {2}", Category, Method, Path);
            }
        }

        // UI vezérlők
        private TextBox txtBaseUrl;
        private TextBox txtToken;
        private ComboBox cmbEndpoints;
        private ComboBox cmbMethod;
        private TextBox txtFinalUrl;
        private Button btnSend;
        private TextBox txtRequestBody;
        private Label lblStatus;
        private DataGridView dgvResult;
        private TextBox txtRawResponse;

        // A Swagger dokumentáció összes végpontja
        private readonly List<ApiEndpoint> _endpoints = new List<ApiEndpoint>
        {
            // Auth
            new ApiEndpoint("Auth", "POST", "/api/Auth/register", "{\r\n  \"username\": \"tesztuser\",\r\n  \"email\": \"teszt@transix.hu\",\r\n  \"password\": \"Jelszo123!\"\r\n}"),
            new ApiEndpoint("Auth", "POST", "/api/Auth/login", "{\r\n  \"username\": \"tesztuser\",\r\n  \"password\": \"Jelszo123!\"\r\n}"),
            new ApiEndpoint("Auth", "PUT",  "/api/Auth/set-role/{userId}", "{\r\n  \"role\": \"Admin\"\r\n}"),

            // FareRates
            new ApiEndpoint("FareRates", "GET",  "/api/FareRates"),
            new ApiEndpoint("FareRates", "POST", "/api/FareRates", "{\r\n  \"name\": \"Normál díjszabás\",\r\n  \"pricePerKm\": 50\r\n}"),

            // Notifications
            new ApiEndpoint("Notifications", "GET", "/api/Notifications/user/{userId}"),
            new ApiEndpoint("Notifications", "PUT", "/api/Notifications/{id}/read"),

            // Passes
            new ApiEndpoint("Passes", "POST", "/api/Passes/buy", "{\r\n  \"userId\": 1,\r\n  \"passTypeId\": 1\r\n}"),

            // PassTypes
            new ApiEndpoint("PassTypes", "GET",  "/api/PassTypes"),
            new ApiEndpoint("PassTypes", "POST", "/api/PassTypes", "{\r\n  \"name\": \"Havi bérlet\",\r\n  \"price\": 9500,\r\n  \"durationDays\": 30\r\n}"),
            new ApiEndpoint("PassTypes", "PUT",  "/api/PassTypes/{id}/deactivate"),

            // Reservations
            new ApiEndpoint("Reservations", "POST", "/api/Reservations/generate-seats", "{\r\n  \"tripId\": 1,\r\n  \"seatCount\": 40\r\n}"),
            new ApiEndpoint("Reservations", "GET",  "/api/Reservations/seats/{tripId}"),
            new ApiEndpoint("Reservations", "POST", "/api/Reservations/reserve", "{\r\n  \"tripId\": 1,\r\n  \"seatNumber\": 5,\r\n  \"userId\": 1\r\n}"),

            // Routes
            new ApiEndpoint("Routes", "GET",  "/api/Routes/stops"),
            new ApiEndpoint("Routes", "POST", "/api/Routes/stops", "{\r\n  \"routeId\": 1,\r\n  \"stopId\": 1\r\n}"),
            new ApiEndpoint("Routes", "POST", "/api/Routes", "{\r\n  \"name\": \"Budapest - Kecskemét\"\r\n}"),
            new ApiEndpoint("Routes", "POST", "/api/Routes/add-stop", "{\r\n  \"routeId\": 1,\r\n  \"stopId\": 2,\r\n  \"order\": 2\r\n}"),

            // Stops
            new ApiEndpoint("Stops", "GET",  "/api/Stops"),
            new ApiEndpoint("Stops", "POST", "/api/Stops", "{\r\n  \"name\": \"Kiskunfélegyháza vasútállomás\",\r\n  \"latitude\": 46.711,\r\n  \"longitude\": 19.847\r\n}"),

            // Tickets
            new ApiEndpoint("Tickets", "POST", "/api/Tickets/buy", "{\r\n  \"tripId\": 1,\r\n  \"userId\": 1\r\n}"),
            new ApiEndpoint("Tickets", "POST", "/api/Tickets/validate", "{\r\n  \"ticketCode\": \"ABC-123\"\r\n}"),

            // TripEvents
            new ApiEndpoint("TripEvents", "POST", "/api/TripEvents", "{\r\n  \"tripId\": 1,\r\n  \"eventType\": \"Delay\",\r\n  \"description\": \"10 perc késés\"\r\n}"),
            new ApiEndpoint("TripEvents", "PUT",  "/api/TripEvents/trips/{tripId}/status", "{\r\n  \"status\": \"InProgress\"\r\n}"),
            new ApiEndpoint("TripEvents", "GET",  "/api/TripEvents/trip/{tripId}"),

            // Trips
            new ApiEndpoint("Trips", "GET",  "/api/Trips"),
            new ApiEndpoint("Trips", "POST", "/api/Trips", "{\r\n  \"routeId\": 1,\r\n  \"vehicleId\": 1,\r\n  \"departureTime\": \"2026-11-17T14:00:00Z\"\r\n}"),

            // Vehicles
            new ApiEndpoint("Vehicles", "GET",  "/api/Vehicles"),
            new ApiEndpoint("Vehicles", "POST", "/api/Vehicles", "{\r\n  \"licensePlate\": \"ABC-123\",\r\n  \"capacity\": 50,\r\n  \"model\": \"Mercedes-Benz Tourismo\"\r\n}")
        };

        public Form1()
        {
            InitializeComponent();
            BuildCustomUi();
            LoadEndpoints();
        }

        private void BuildCustomUi()
        {
            this.Text = "TRANSIX API - Adatbázis Kezelő & Tesztelő Kliens (.NET 4.7.2)";
            this.Size = new Size(1150, 780);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Font = new Font("Segoe UI", 9.5f);

            // Felső konfigurációs panel
            Panel topPanel = new Panel
            {
                Dock = DockStyle.Top,
                Height = 125,
                Padding = new Padding(10),
                BackColor = Color.WhiteSmoke
            };

            Label lblBase = new Label { Text = "Base URL:", Location = new Point(12, 15), AutoSize = true };
            txtBaseUrl = new TextBox { Text = "http://localhost:5178", Location = new Point(90, 12), Width = 240 };

            Label lblTok = new Label { Text = "JWT Token:", Location = new Point(350, 15), AutoSize = true };
            txtToken = new TextBox { Location = new Point(435, 12), Width = 680 };

            Label lblEp = new Label { Text = "Végpont:", Location = new Point(12, 50), AutoSize = true };
            cmbEndpoints = new ComboBox { Location = new Point(90, 47), Width = 520, DropDownStyle = ComboBoxStyle.DropDownList };
            cmbEndpoints.SelectedIndexChanged += CmbEndpoints_SelectedIndexChanged;

            Label lblHint = new Label
            {
                Text = "Tipp: A {userId}, {id}, {tripId} paramétereket írd át közvetlenül az alsó URL mezőben!",
                Location = new Point(625, 50),
                AutoSize = true,
                ForeColor = Color.DimGray
            };

            cmbMethod = new ComboBox { Location = new Point(12, 83), Width = 72, DropDownStyle = ComboBoxStyle.DropDownList };
            cmbMethod.Items.AddRange(new object[] { "GET", "POST", "PUT", "DELETE" });

            txtFinalUrl = new TextBox
            {
                Location = new Point(90, 83),
                Width = 880,
                Font = new Font("Consolas", 10f, FontStyle.Bold)
            };

            btnSend = new Button
            {
                Text = "Küldés ▶",
                Location = new Point(980, 81),
                Width = 135,
                Height = 29,
                BackColor = Color.FromArgb(0, 120, 215),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold)
            };
            btnSend.Click += BtnSend_Click;

            topPanel.Controls.AddRange(new Control[]
            {
                lblBase, txtBaseUrl, lblTok, txtToken, lblEp, cmbEndpoints, lblHint, cmbMethod, txtFinalUrl, btnSend
            });

            // Fő osztott panel
            SplitContainer mainSplit = new SplitContainer
            {
                Dock = DockStyle.Fill,
                Orientation = Orientation.Vertical,
                SplitterDistance = 380,
                Padding = new Padding(10)
            };

            // Bal oldal: Request Body
            Panel leftPanel = new Panel { Dock = DockStyle.Fill };
            Label lblBody = new Label { Text = "Kérés törzse (JSON Request Body - POST / PUT esetén):", Dock = DockStyle.Top, Height = 25 };
            Button btnFormat = new Button { Text = "JSON formázása", Dock = DockStyle.Bottom, Height = 30 };
            btnFormat.Click += delegate { FormatRequestJson(); };

            txtRequestBody = new TextBox
            {
                Dock = DockStyle.Fill,
                Multiline = true,
                ScrollBars = ScrollBars.Both,
                Font = new Font("Consolas", 10f),
                AcceptsTab = true
            };

            leftPanel.Controls.Add(txtRequestBody);
            leftPanel.Controls.Add(lblBody);
            leftPanel.Controls.Add(btnFormat);
            mainSplit.Panel1.Controls.Add(leftPanel);

            // Jobb oldal: Válasz (Status + TabControl)
            Panel rightPanel = new Panel { Dock = DockStyle.Fill };
            lblStatus = new Label
            {
                Text = "Állapot: Készen áll a kérés küldésére",
                Dock = DockStyle.Top,
                Height = 28,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold)
            };

            TabControl tabControl = new TabControl { Dock = DockStyle.Fill };

            TabPage tabGrid = new TabPage("Táblázat nézet (Adatbázis rekordok)");
            dgvResult = new DataGridView
            {
                Dock = DockStyle.Fill,
                ReadOnly = true,
                AllowUserToAddRows = false,
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
                BackgroundColor = Color.White
            };
            tabGrid.Controls.Add(dgvResult);

            TabPage tabRaw = new TabPage("Nyers JSON válasz");
            txtRawResponse = new TextBox
            {
                Dock = DockStyle.Fill,
                Multiline = true,
                ReadOnly = true,
                ScrollBars = ScrollBars.Both,
                Font = new Font("Consolas", 10f),
                BackColor = Color.FromArgb(30, 30, 30),
                ForeColor = Color.LightGreen
            };
            tabRaw.Controls.Add(txtRawResponse);

            tabControl.TabPages.Add(tabGrid);
            tabControl.TabPages.Add(tabRaw);

            rightPanel.Controls.Add(tabControl);
            rightPanel.Controls.Add(lblStatus);
            mainSplit.Panel2.Controls.Add(rightPanel);

            this.Controls.Add(mainSplit);
            this.Controls.Add(topPanel);
        }

        private void LoadEndpoints()
        {
            foreach (ApiEndpoint ep in _endpoints)
            {
                cmbEndpoints.Items.Add(ep);
            }

            if (cmbEndpoints.Items.Count > 0)
            {
                cmbEndpoints.SelectedIndex = 0;
            }
        }

        private void CmbEndpoints_SelectedIndexChanged(object sender, EventArgs e)
        {
            ApiEndpoint ep = cmbEndpoints.SelectedItem as ApiEndpoint;
            if (ep == null) return;

            cmbMethod.SelectedItem = ep.Method;
            string baseUrl = txtBaseUrl.Text.TrimEnd('/');
            txtFinalUrl.Text = baseUrl + ep.Path;
            txtRequestBody.Text = ep.SampleJson;
        }

        private void FormatRequestJson()
        {
            if (string.IsNullOrWhiteSpace(txtRequestBody.Text)) return;
            txtRequestBody.Text = SimpleJson.PrettyPrint(txtRequestBody.Text);
        }

        private async void BtnSend_Click(object sender, EventArgs e)
        {
            string url = txtFinalUrl.Text.Trim();
            if (url.Contains("{") || url.Contains("}"))
            {
                MessageBox.Show("Cseréld le az URL-ben található {id} / {userId} / {tripId} helyőrzőt egy valós számra!",
                    "Hiányzó paraméter", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            btnSend.Enabled = false;
            lblStatus.Text = "Állapot: Kérés folyamatban...";
            lblStatus.ForeColor = Color.DarkOrange;

            try
            {
                string method = cmbMethod.SelectedItem != null ? cmbMethod.SelectedItem.ToString() : "GET";
                using (HttpRequestMessage request = new HttpRequestMessage(new HttpMethod(method), url))
                {
                    // JWT Token csatolása, ha van
                    string token = txtToken.Text.Trim();
                    if (!string.IsNullOrEmpty(token))
                    {
                        if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                        {
                            token = token.Substring(7).Trim();
                        }
                        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    }

                    // Request Body csatolása
                    if (method != "GET" && !string.IsNullOrWhiteSpace(txtRequestBody.Text))
                    {
                        request.Content = new StringContent(txtRequestBody.Text, Encoding.UTF8, "application/json");
                    }

                    HttpResponseMessage response = await _httpClient.SendAsync(request);
                    string responseBody = await response.Content.ReadAsStringAsync();

                    lblStatus.Text = string.Format("Állapot: {0} {1}", (int)response.StatusCode, response.ReasonPhrase);
                    lblStatus.ForeColor = response.IsSuccessStatusCode ? Color.DarkGreen : Color.Crimson;

                    txtRawResponse.Text = string.IsNullOrWhiteSpace(responseBody)
                        ? "(Üres válasz törzs)"
                        : SimpleJson.PrettyPrint(responseBody);

                    if (response.IsSuccessStatusCode && url.EndsWith("/login", StringComparison.OrdinalIgnoreCase))
                    {
                        TryExtractToken(responseBody);
                    }

                    PopulateDataGrid(responseBody);
                }
            }
            catch (Exception ex)
            {
                lblStatus.Text = "Állapot: Hálózati / Kapcsolódási hiba";
                lblStatus.ForeColor = Color.Crimson;
                txtRawResponse.Text = string.Format(
                    "Hiba történt a kérés során:\r\n{0}\r\n\r\nEllenőrizd, hogy fut-e a backend a {1} címen!",
                    ex.Message, txtBaseUrl.Text);
            }
            finally
            {
                btnSend.Enabled = true;
            }
        }

        private void TryExtractToken(string responseBody)
        {
            try
            {
                object parsed = SimpleJson.Parse(responseBody);
                string strToken = parsed as string;
                if (!string.IsNullOrEmpty(strToken))
                {
                    txtToken.Text = strToken;
                    return;
                }

                Dictionary<string, object> dict = parsed as Dictionary<string, object>;
                if (dict == null) return;

                string[] possibleKeys = { "token", "accessToken", "jwt", "Token", "AccessToken" };
                foreach (string key in possibleKeys)
                {
                    if (dict.ContainsKey(key) && dict[key] != null)
                    {
                        txtToken.Text = dict[key].ToString();
                        break;
                    }
                }
            }
            catch
            {
                // Ha nem JSON formátumú a válasz, a token kézzel is beilleszthető
            }
        }

        private void PopulateDataGrid(string json)
        {
            dgvResult.DataSource = null;
            if (string.IsNullOrWhiteSpace(json)) return;

            try
            {
                object parsed = SimpleJson.Parse(json);
                List<object> list = parsed as List<object>;

                // Ha burkolt objektumban érkezik a lista (pl. { "data": [...] })
                if (list == null && parsed is Dictionary<string, object>)
                {
                    Dictionary<string, object> dict = (Dictionary<string, object>)parsed;
                    foreach (KeyValuePair<string, object> kvp in dict)
                    {
                        if (kvp.Value is List<object>)
                        {
                            list = (List<object>)kvp.Value;
                            break;
                        }
                    }

                    // Egyetlen visszaadott rekord megjelenítése 1 soros táblázatban
                    if (list == null)
                    {
                        list = new List<object> { dict };
                    }
                }

                if (list == null || list.Count == 0) return;

                DataTable dt = new DataTable();
                foreach (object item in list)
                {
                    Dictionary<string, object> rowObj = item as Dictionary<string, object>;
                    if (rowObj == null) continue;

                    foreach (string key in rowObj.Keys)
                    {
                        if (!dt.Columns.Contains(key))
                        {
                            dt.Columns.Add(key);
                        }
                    }

                    DataRow row = dt.NewRow();
                    foreach (KeyValuePair<string, object> kvp in rowObj)
                    {
                        if (kvp.Value == null)
                            row[kvp.Key] = "null";
                        else if (kvp.Value is List<object> || kvp.Value is Dictionary<string, object>)
                            row[kvp.Key] = "[Beágyazott adat]";
                        else
                            row[kvp.Key] = kvp.Value.ToString();
                    }
                    dt.Rows.Add(row);
                }

                dgvResult.DataSource = dt;
            }
            catch
            {
                // Nem táblázatos válasz esetén a Nyers JSON fülön olvasható az eredmény
            }
        }

        /// <summary>
        /// Külső függőségek nélküli JSON elemző és formázó .NET Framework 4.7.2-höz
        /// </summary>
        private static class SimpleJson
        {
            public static string PrettyPrint(string json)
            {
                if (string.IsNullOrWhiteSpace(json)) return json;

                StringBuilder sb = new StringBuilder();
                int indent = 0;
                bool inString = false;
                bool escaped = false;

                for (int i = 0; i < json.Length; i++)
                {
                    char c = json[i];

                    if (inString)
                    {
                        sb.Append(c);
                        if (escaped)
                            escaped = false;
                        else if (c == '\\')
                            escaped = true;
                        else if (c == '"')
                            inString = false;
                        continue;
                    }

                    if (char.IsWhiteSpace(c)) continue;

                    switch (c)
                    {
                        case '"':
                            inString = true;
                            sb.Append(c);
                            break;
                        case '{':
                        case '[':
                            sb.Append(c);
                            indent++;
                            sb.Append("\r\n");
                            sb.Append(new string(' ', indent * 2));
                            break;
                        case '}':
                        case ']':
                            indent = Math.Max(0, indent - 1);
                            sb.Append("\r\n");
                            sb.Append(new string(' ', indent * 2));
                            sb.Append(c);
                            break;
                        case ',':
                            sb.Append(c);
                            sb.Append("\r\n");
                            sb.Append(new string(' ', indent * 2));
                            break;
                        case ':':
                            sb.Append(": ");
                            break;
                        default:
                            sb.Append(c);
                            break;
                    }
                }

                return sb.ToString();
            }

            public static object Parse(string json)
            {
                int index = 0;
                return ParseValue(json, ref index);
            }

            private static object ParseValue(string json, ref int index)
            {
                SkipWhitespace(json, ref index);
                if (index >= json.Length) return null;

                char c = json[index];
                if (c == '{') return ParseObject(json, ref index);
                if (c == '[') return ParseArray(json, ref index);
                if (c == '"') return ParseString(json, ref index);
                if (c == 't' && json.Substring(index).StartsWith("true")) { index += 4; return true; }
                if (c == 'f' && json.Substring(index).StartsWith("false")) { index += 5; return false; }
                if (c == 'n' && json.Substring(index).StartsWith("null")) { index += 4; return null; }

                return ParsePrimitive(json, ref index);
            }

            private static Dictionary<string, object> ParseObject(string json, ref int index)
            {
                Dictionary<string, object> dict = new Dictionary<string, object>();
                index++; // '{' átugrása

                while (index < json.Length)
                {
                    SkipWhitespace(json, ref index);
                    if (index < json.Length && json[index] == '}')
                    {
                        index++;
                        break;
                    }

                    string key = ParseString(json, ref index);
                    SkipWhitespace(json, ref index);
                    if (index < json.Length && json[index] == ':') index++;

                    object val = ParseValue(json, ref index);
                    if (key != null) dict[key] = val;

                    SkipWhitespace(json, ref index);
                    if (index < json.Length && json[index] == ',')
                    {
                        index++;
                    }
                    else if (index < json.Length && json[index] == '}')
                    {
                        index++;
                        break;
                    }
                }

                return dict;
            }

            private static List<object> ParseArray(string json, ref int index)
            {
                List<object> list = new List<object>();
                index++; // '[' átugrása

                while (index < json.Length)
                {
                    SkipWhitespace(json, ref index);
                    if (index < json.Length && json[index] == ']')
                    {
                        index++;
                        break;
                    }

                    list.Add(ParseValue(json, ref index));

                    SkipWhitespace(json, ref index);
                    if (index < json.Length && json[index] == ',')
                    {
                        index++;
                    }
                    else if (index < json.Length && json[index] == ']')
                    {
                        index++;
                        break;
                    }
                }

                return list;
            }

            private static string ParseString(string json, ref int index)
            {
                if (index >= json.Length || json[index] != '"') return null;
                index++; // nyitó '"'

                StringBuilder sb = new StringBuilder();
                while (index < json.Length)
                {
                    char c = json[index++];
                    if (c == '"') break;

                    if (c == '\\' && index < json.Length)
                    {
                        char esc = json[index++];
                        switch (esc)
                        {
                            case '"': sb.Append('"'); break;
                            case '\\': sb.Append('\\'); break;
                            case '/': sb.Append('/'); break;
                            case 'b': sb.Append('\b'); break;
                            case 'f': sb.Append('\f'); break;
                            case 'n': sb.Append('\n'); break;
                            case 'r': sb.Append('\r'); break;
                            case 't': sb.Append('\t'); break;
                            case 'u':
                                if (index + 4 <= json.Length)
                                {
                                    string hex = json.Substring(index, 4);
                                    int code;
                                    if (int.TryParse(hex, NumberStyles.HexNumber, CultureInfo.InvariantCulture, out code))
                                    {
                                        sb.Append((char)code);
                                    }
                                    index += 4;
                                }
                                break;
                            default:
                                sb.Append(esc);
                                break;
                        }
                    }
                    else
                    {
                        sb.Append(c);
                    }
                }

                return sb.ToString();
            }

            private static string ParsePrimitive(string json, ref int index)
            {
                int start = index;
                while (index < json.Length && ",}] \r\n\t".IndexOf(json[index]) == -1)
                {
                    index++;
                }
                return json.Substring(start, index - start);
            }

            private static void SkipWhitespace(string json, ref int index)
            {
                while (index < json.Length && char.IsWhiteSpace(json[index]))
                {
                    index++;
                }
            }
        }
    }
}